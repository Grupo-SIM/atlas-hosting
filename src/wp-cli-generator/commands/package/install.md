# wp package install

Installs a WP-CLI package.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

Packages are required to be a valid Composer package, and can be specified as:

* Package name from WP-CLI's package index.
* Git URL accessible by the current shell user.
* Path to a directory on the local machine.
* Local or remote .zip file.

Packages are installed to `~/.wp-cli/packages/` by default. Use the `WP_CLI_PACKAGES_DIR` environment variable to provide a custom path.

When installing a local directory, WP-CLI simply registers a reference to the directory. If you move or delete the directory, WP-CLI's reference breaks.

When installing a .zip file, WP-CLI extracts the package to `~/.wp-cli/packages/local/<package-name>`.

If Github token authorization is required, a GitHub Personal Access Token (https://github.com/settings/tokens) can be used. The following command will add a GitHub Personal Access Token to Composer's global configuration:
composer config -g github-oauth.github.com <GITHUB_TOKEN> Once this has been added, the value used for <GITHUB_TOKEN> will be used for future authorization requests.

### OPTIONS

<name|git|path|zip>
: Name, git URL, directory path, or .zip file for the package to install. Names can optionally include a version constraint (e.g. wp-cli/server-command:@stable).

[--insecure]
: Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

### EXAMPLES

    # Install a package hosted at a git URL.
    $ wp package install runcommand/hook

    # Install the latest stable version.
    $ wp package install wp-cli/server-command:@stable

    # Install a package hosted at a GitLab.com URL.
    $ wp package install https://gitlab.com/foo/wp-cli-bar-command.git

    # Install a package in a .zip file.
    $ wp package install google-sitemap-generator-cli.zip


