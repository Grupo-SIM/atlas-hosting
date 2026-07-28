import fs from "node:fs";
import path from "node:path";

// --- TYPE DEFINITIONS for wp-cli-documentation.json ---

interface WpCliOption {
  name: string;
  description: string;
  required?: boolean;
  type?: string;
  default?: string;
  choices?: string[];
}

interface WpCliExample {
  command: string;
  description?: string;
  output?: string;
}

interface WpCliAvailableField {
  name: string;
}

interface WpCliSubCommand {
  name: string;
  description: string;
  options: WpCliOption[];
  examples: WpCliExample[];
  availableFields?: WpCliAvailableField[];
}

interface WpCliCommandDef {
  name: string;
  description: string;
  subCommands: Record<string, WpCliSubCommand>;
  options?: WpCliOption[];
  examples?: WpCliExample[];
  availableFields?: WpCliAvailableField[];
}

type WpCliDocumentation = Record<string, WpCliCommandDef>;

// --- UTILITY FUNCTIONS ---

/** Converts kebab-case or snake_case to camelCase */
const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/gi, $1 => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

/** Converts a string to PascalCase for class/interface names */
const toPascalCase = (str: string): string => {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

/** Generates a JSDoc block from a command definition */
const generateJsDoc = (def: {
  name: string;
  description: string;
  examples: WpCliExample[];
}): string => {
  const lines = ["/**"];
  lines.push(` * ${def.description.replace(/\n/g, "\n * ")}`);
  if (def.examples && def.examples.length > 0) {
    lines.push(" *");
    for (const ex of def.examples) {
      lines.push(" * @example");
      if (ex.description) {
        lines.push(` * // ${ex.description}`);
      }
      // Construct a plausible method call for the example
      const commandParts = def.name.split(" ");
      const mainCommand = toCamelCase(commandParts[0]);
      const subCommand = toCamelCase(commandParts.slice(1).join("-") || "run");
      lines.push(` * WpCli.${mainCommand}.${subCommand}(...);`);
      lines.push(" * ```sh");
      lines.push(` * ${ex.command}`);
      lines.push(" * ```");
    }
  }
  lines.push(" */");
  return lines.join("\n");
};

/** Generates a TypeScript interface for a command's options */
const generateOptionsInterface = (
  interfaceName: string,
  options: WpCliOption[]
): string | undefined => {
  if (!options || options.length === 0) return `interface ${interfaceName} {}`;
  const lines = [
    `interface ${interfaceName} extends Record<string, string | number | boolean> {`,
  ];
  for (const opt of options) {
    if (opt.name === "---") {
      return;
    }

    const propName = toCamelCase(opt.name.replace(/^--/, ""));
    const isOptional = !opt.required;

    let propType = "string";
    if (opt.choices) {
      propType = opt.choices
        .map(c => `'${c.replace(/^['"]|['"]$/g, "")}'`)
        .join(" | ");
    } else if (!opt.type) {
      propType = "boolean";
    } else if (
      ["number", "count", "page", "per-page", "post_id", "term-id"].includes(
        opt.type
      )
    ) {
      propType = "number";
    }

    const description = opt.description ? `  /** ${opt.description} */\n` : "";
    lines.push(
      `${description}  ${propName}${isOptional ? "?" : ""}: ${propType};`
    );
  }
  lines.push("}");
  if (lines.length === 2) {
    return `interface ${interfaceName} {}`;
  }
  return lines.join("\n");
};

/** Generates a TypeScript interface for a command's structured data output */
const generateDataObjectInterface = (
  interfaceName: string,
  fields: WpCliAvailableField[]
): string => {
  if (!fields || fields.length === 0) return "";
  const lines = [`interface ${interfaceName} {`];
  for (const field of fields) {
    const propName = toCamelCase(field.name.split(" ")[0]);
    lines.push(`  ${propName}: string | number;`);
  }
  lines.push("}");
  return lines.join("\n");
};

/** Configuration for method signatures that need special handling */
const COMMAND_CONFIG: Record<
  string,
  Record<
    string,
    {
      methodName?: string;
      posArgs?: { name: string; type: string; isOptional?: boolean }[];
    }
  >
> = {
  core: {
    install: { posArgs: [{ name: "url", type: "string" }] },
    update: {
      posArgs: [{ isOptional: true, name: "zipPath", type: "string" }],
    },
  },
  db: {
    export: {
      posArgs: [{ isOptional: true, name: "outputFile", type: "string" }],
    },
    import: { posArgs: [{ name: "file", type: "string" }] },
    query: { posArgs: [{ name: "sql", type: "string" }] },
  },
  plugin: {
    activate: { posArgs: [{ name: "plugins", type: "string | string[]" }] },
    deactivate: { posArgs: [{ name: "plugins", type: "string | string[]" }] },
    delete: {
      methodName: "deletePlugins",
      posArgs: [{ name: "plugins", type: "string | string[]" }],
    },
    install: { posArgs: [{ name: "plugins", type: "string | string[]" }] },
  },
  post: {
    create: { posArgs: [] },
    delete: {
      methodName: "deletePosts",
      posArgs: [{ name: "postIds", type: "number | number[]" }],
    },
    update: { posArgs: [{ name: "postIds", type: "number | number[]" }] },
  },
  "search-replace": {
    run: {
      methodName: "run",
      posArgs: [
        { name: "oldStr", type: "string" },
        { name: "newStr", type: "string" },
        { isOptional: true, name: "tables", type: "string[]" },
      ],
    },
  },
  theme: {
    activate: { posArgs: [{ name: "themeName", type: "string" }] },
    delete: {
      methodName: "deleteThemes",
      posArgs: [{ name: "themes", type: "string | string[]" }],
    },
    install: { posArgs: [{ name: "themes", type: "string | string[]" }] },
  },
  user: {
    create: {
      posArgs: [
        { name: "userLogin", type: "string" },
        { name: "userEmail", type: "string" },
      ],
    },
    delete: {
      methodName: "deleteUsers",
      posArgs: [{ name: "userIds", type: "number | number[]" }],
    },
    update: { posArgs: [{ name: "userIds", type: "number | number[]" }] },
  },
};

/** Main generation function */
const generateWrapper = () => {
  console.log("Reading documentation...");
  const doc = JSON.parse(
    fs.readFileSync(path.join(__dirname, "wp-cli-documentation.json"), "utf-8")
  ) as WpCliDocumentation;
  const output: string[] = [];

  const boilerplate = `
import pleskApi from "@/lib/server/apis/plesk";

/**
 * Base class for all WP-CLI command groups.
 * It contains the logic to build and execute a command string.
 */
abstract class WpCliCommand {
  /**
   * Executes the final command string via the Plesk API.
   * @param command The complete wp-cli command string.
   * @returns The result from the API call, cast to the specified type.
   */
  protected async execute<T>(command: string): Promise<T> {
    const data = await pleskApi.wordpress.callWp(command);
    return data as T;
  }

  /**
   * Constructs a wp-cli command string from base command, arguments, and options.
   * @param base The base command (e.g., "plugin install").
   * @param args An array of positional arguments.
   * @param options An object of flags and their values.
   * @returns A fully formed command string.
   */
  protected buildCommand(
    base: string,
    args: (string | number | string[] | undefined)[] = [],
    options: Record<string, string | number | boolean> = {}
  ): string {
    let command = base;

    const flatArgs = args.flat().filter(arg => arg !== undefined);
    if (flatArgs.length > 0) {
      command += \` \${flatArgs
        .map((arg) => {
          const val = String(arg);
          return val.includes(" ") ? \`"\${val}"\` : val;
        })
        .join(" ")}\`;
    }
    
    for (const [key, value] of Object.entries(options ?? {})) {
      if (value === undefined || value === null || value === false) {
        continue;
      }

      const flag = \`--\${key.replace(/[A-Z]/g, (letter) => \`-\${letter.toLowerCase()}\`)}\`;

      if (value === true) {
        command += \` \${flag}\`;
      } else {
        const val = String(value);
        command += \` \${flag}=\${val.includes(" ") ? \`"\${val}"\` : val}\`;
      }
    }

    return command.trim();
  }
}
    `;
  output.push(boilerplate.trim());

  const allDataObjectInterfaces: string[] = [];
  const allOptionsInterfaces: string[] = [];
  const commandClasses: string[] = [];
  const mainApiClassProps: string[] = [];

  for (const commandKey in doc) {
    const commandDef = doc[commandKey];
    const commandClassName = `${toPascalCase(commandKey)}Command`;
    const commandClassMethods: string[] = [];
    const camelCommandKey = toCamelCase(commandKey);

    mainApiClassProps.push(
      `  public readonly ${camelCommandKey} = new ${commandClassName}();`
    );

    const subCommands = commandDef.subCommands || {};

    if (Object.keys(subCommands).length === 0) {
      const config = COMMAND_CONFIG[commandKey]?.run || {};
      const methodName = config.methodName || "run";
      const optionsInterfaceName = `${toPascalCase(commandKey)}Options`;
      if (commandDef.options) {
        const opt = generateOptionsInterface(
          optionsInterfaceName,
          commandDef.options
        );

        if (opt) {
          allOptionsInterfaces.push(opt);
        }
      }

      const areAllOptionsOptional =
        commandDef.options?.every(o => !o.required) ?? true;
      const posArgs =
        config.posArgs
          ?.map(p => `${p.name}${p.isOptional ? "?" : ""}: ${p.type}`)
          .join(", ") || "";
      const methodArgs = `${posArgs}${posArgs ? ", " : ""}options${areAllOptionsOptional ? "?" : ""}: ${optionsInterfaceName}`;
      const posArgNames = config.posArgs?.map(p => p.name).join(", ") || "";

      const { examples, ...commandDef_ } = commandDef;

      commandClassMethods.push(`
  ${generateJsDoc({ ...commandDef_, examples: examples ?? [], name: commandKey })}
  async ${methodName}(${methodArgs}): Promise<string> {
    const args = [${posArgNames}];
    const command = this.buildCommand('${commandKey}', args, options);
    return this.execute<string>(command);
  }
            `);
    }

    for (const subCommandKey in subCommands) {
      const subDef = subCommands[subCommandKey];
      const pascalSubKey = toPascalCase(subCommandKey);
      const dataObjectInterfaceName = `Wp${toPascalCase(commandKey)}${pascalSubKey}`;
      const optionsInterfaceName = `${toPascalCase(commandKey)}${pascalSubKey}Options`;

      if (subDef.availableFields) {
        allDataObjectInterfaces.push(
          generateDataObjectInterface(
            dataObjectInterfaceName,
            subDef.availableFields
          )
        );
      }

      if (subDef.options) {
        const opt = generateOptionsInterface(
          optionsInterfaceName,
          subDef.options
        );

        if (opt) {
          allOptionsInterfaces.push(opt);
        }
      }

      const commandPath = `${commandKey} ${subCommandKey}`;
      const config = COMMAND_CONFIG[commandKey]?.[subCommandKey] || {};
      let methodName = config.methodName || toCamelCase(subCommandKey);
      if (methodName === "delete") methodName = `delete${pascalSubKey}`;

      const posArgs =
        config.posArgs?.map(
          p => `${p.name}${p.isOptional ? "?" : ""}: ${p.type}`
        ) || [];
      const posArgNames = config.posArgs?.map(p => p.name) || [];

      const hasOptions = subDef.options?.length > 0;
      const areAllOptionsOptional = hasOptions
        ? subDef.options?.every(o => !o.required)
        : true;

      const optionsArg = hasOptions
        ? [
            `options${areAllOptionsOptional ? "?" : ""}: ${optionsInterfaceName}`,
          ]
        : [];
      const allArgs = [...posArgs, ...optionsArg].join(", ");

      const jsdoc = generateJsDoc({ ...subDef, name: commandPath });
      let methodBody = "";

      const hasJsonOverload = subDef.options?.some(
        o => o.name === "--format" && o.choices?.includes("json")
      );
      const hasPorcelainOverload = subDef.options?.some(
        o => o.name === "--porcelain"
      );

      // [FIX] Correctly format arguments for buildCommand call
      const buildCommandArgs =
        posArgNames.length > 0 ? `[${posArgNames.join(", ")}]` : "[]";

      if (hasJsonOverload && subDef.availableFields) {
        const dataInterface = dataObjectInterfaceName;
        methodBody = `
  ${jsdoc}
  async ${methodName}(${[...posArgs, `options: ${optionsInterfaceName} & { format: 'json' }`].join(", ")}): Promise<${dataInterface}[]>;
  async ${methodName}(${[...posArgs, `options?: Omit<${optionsInterfaceName}, 'format'>`].join(", ")}): Promise<string>;
  async ${methodName}(${allArgs}): Promise<string | ${dataInterface}[]> {
    const command = this.buildCommand('${commandPath}', ${buildCommandArgs}${hasOptions ? ", options" : ""});
    if ((options as {format?: string})?.format === 'json') {
      return this.execute<${dataInterface}[]>(command);
    }
    return this.execute<string>(command);
  }
`;
      } else if (hasPorcelainOverload) {
        methodBody = `
  ${jsdoc}
  async ${methodName}(${[...posArgs, `options: ${optionsInterfaceName} & { porcelain: true }`].join(", ")}): Promise<number>;
  async ${methodName}(${[...posArgs, `options?: Omit<${optionsInterfaceName}, 'porcelain'>`].join(", ")}): Promise<string>;
  async ${methodName}(${allArgs}): Promise<string | number> {
    const command = this.buildCommand('${commandPath}', ${buildCommandArgs}${hasOptions ? ", options" : ""});
    if ((options as {porcelain?: boolean})?.porcelain) {
      const result = await this.execute<string>(command);
      return Number.parseInt(result.trim(), 10);
    }
    return this.execute<string>(command);
  }
`;
      } else {
        methodBody = `
  ${jsdoc}
  async ${methodName}(${allArgs}): Promise<string> {
    const command = this.buildCommand('${commandPath}', ${buildCommandArgs}${hasOptions ? ", options" : ""});
    return this.execute<string>(command);
  }
`;
      }
      commandClassMethods.push(methodBody);
    }

    commandClasses.push(`
class ${commandClassName} extends WpCliCommand {
${commandClassMethods.join("\n")}
}
`);
  }

  output.push("\n// #region Type Interfaces\n");
  output.push("// --- DATA STRUCTURES ---");
  output.push(allDataObjectInterfaces.join("\n\n"));
  output.push("\n// --- OPTIONS INTERFACES ---");
  output.push(allOptionsInterfaces.join("\n\n"));
  output.push("\n// #endregion\n");

  output.push("\n// #region Command Classes\n");
  output.push(commandClasses.join("\n"));
  output.push("\n// #endregion\n");

  const mainApiClass = `
/**
 * Main WP-CLI API Wrapper Class
 * This class provides a structured and type-safe way to interact with wp-cli.
 */
export class WpCliApi {
${mainApiClassProps.join("\n")}
}

/**
 * Singleton instance of the WpCliApi.
 * @example
 * import WpCli from './path/to/this/file';
 *
 * async function getPlugins() {
 * const plugins = await WpCli.plugin.list({ status: 'active', format: 'json' });
 * // \`plugins\` is now strongly typed
 * plugins.forEach(plugin => console.log(plugin.name, plugin.version));
 * }
 */
const WpCli = new WpCliApi();
export default WpCli;
    `;
  output.push(mainApiClass);

  const outputPath = path.join(__dirname, "index.ts");
  fs.writeFileSync(outputPath, output.join("\n"), "utf-8");
  console.log(`✅ Successfully generated WP-CLI wrapper at ${outputPath}`);
};

generateWrapper();
