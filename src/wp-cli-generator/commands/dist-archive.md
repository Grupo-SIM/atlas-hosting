# wp dist-archive

Create a distribution archive based on a project's .distignore file.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

For a plugin in a directory 'wp-content/plugins/hello-world', this command creates a distribution archive 'wp-content/plugins/hello-world.zip'.

You can specify files or directories you'd like to exclude from the archive with a .distignore file in your project repository:

```
.distignore
.editorconfig
.git
.gitignore
.travis.yml
circle.yml
```

Use one distribution archive command for many projects, instead of a bash script in each project.

### OPTIONS

<path>
: Path to the project that includes a .distignore file.

[<target>]
: Path and optional file name for the distribution archive. If only a path is provided, the file name defaults to the project directory name plus the version, if discoverable. Also, if only a path is given, the directory that it points to has to already exist for the command to function correctly.

[--create-target-dir]
: Automatically create the target directory as needed.

[--force]
: Forces overwriting of the archive file if it already exists.

[--plugin-dirname=<plugin-slug>]
: Set the archive extract directory name. Defaults to project directory name.

[--format=<format>]
: Choose the format for the archive.
---
default: zip
options:
  - zip
  - targz
---

[--filename-format=<filename-format>]
: Use a custom format for archive filename. Available substitutions: {name}, {version}. This is ignored if the <target> parameter is provided or the version cannot be determined.
---
default: "{name}.{version}"
---


