import { User } from "@/lib/db/schema";
import { kebabCase } from "lodash-es";
import { mkdir } from "fs/promises";

export class NixpacksApi {
  public async genImageForRepo(
    user: User,
    repo: `${string}/${string}`,
    config?: NixpacksBuildOptions,
  ): Promise<string> {
    const params = !!config ? this.kebabify(config) : "";

    const baseCwd = `/data/user-builds/${user.id}`;
    const repoCwd = `${baseCwd}/${repo}`;

    if (!this.pathExists(baseCwd)) {
      await mkdir(baseCwd, { recursive: true });
    }

    const [owner, name] = repo.split("/");

    if (this.pathExists(repoCwd)) {
      await this.updateRepo(user, repo);
    } else {
      await this.cloneRepo(user, repo);
    }

    const proc = Bun.spawn(["nixpacks", "build", repo, params], {
      stdout: "pipe",
      cwd: `/data/user-builds/${user.id}`,
      env: {
        NIXPACKS_NODE_VERSION: "20",
      },
    });

    // @ts-expect-error ReadableStream does contain a text() method in Bun;
    const result = await proc.stdout.text();
    return result;
  }

  private kebabify(obj: NixpacksBuildOptions): string {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => `--${kebabCase(key)}=${v}`).join(" ");
        }
        return `--${kebabCase(key)}=${value}`;
      })
      .join(" ");
  }

  private pathExists(path: string) {
    return !!Array.from(new Bun.Glob(path).scanSync({ onlyFiles: false }))[0];
  }

  private async cloneRepo(user: User, repo: string): Promise<void> {
    const cwd = `/data/user-builds/${user.id}`;
    await mkdir(cwd, { recursive: true });
    const proc = Bun.spawn(["git", "clone", repo], { cwd });
    await proc.exited;
  }

  private async updateRepo(user: User, repo: string): Promise<void> {
    const cwd = `/data/user-builds/${user.id}`;

    const f = Bun.spawn(["git", "fetch"], { cwd });
    if ((await f.exited) && f.exitCode !== 0) {
      throw new Error(`Failed to fetch repo: ${repo}`);
    }

    const pull = Bun.spawn(["git", "pull"], { cwd });
    if ((await pull.exited) && pull.exitCode !== 0) {
      throw new Error(`Failed to pull repo: ${repo}`);
    }
  }
}

export interface NixpacksBuildOptions {
  installCmd?: string /** Install command */;
  buildCmd?: string /** Build command */;
  startCmd?: string /** Start command */;
  name?: string /** Name for the built image */;
  env?: string[] /** Environment variables to provide to the build */;
  pkgs?: string[] /** Additional Nix packages to install in the environment */;
  apt?: string[] /** Additional apt packages to install in the environment */;
  libs?: string[] /** Additional Nix libraries to install in the environment */;
  tag?: string[] /** Additional tags to add to the output image */;
  label?: string[] /** Additional labels to add to the output image */;
  cacheKey?: string /** Unique identifier to use for the build cache */;
  noCache?: boolean /** Disable caching for the build */;
  dockerHost?: string /** Specify host for Docker client */;
  dockerTLSVerify: boolean /** Specify if Docker client should verify the TLS (Transport Layer Security) certificates of the Docker daemon when communicating over a secure connection */;
  dockerCertPath?: string /** Specify the path of your cert to docker if your connection is under TLS */;
  cacheFrom?: string /** Specify the image to use as cache source */;
  inlineCache?: boolean /** Enable writing cache metadata into the output image */;
  out?: string /** Save output directory instead of building it with Docker */;
  platform?: string[] /** Specify the target platform for the target environment */;
  config?: string /** Location of the Nixpacks configuration file relative to the root of the app */;
}
