# wp cli update

Updates WP-CLI to the latest release.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

Default behavior is to check the releases API for the newest stable version, and prompt if one is available.

Use `--stable` to install or reinstall the latest stable version.

Use `--nightly` to install the latest built version of the master branch. While not recommended for production, nightly contains the latest and greatest, and should be stable enough for development and staging environments.

Only works for the Phar installation mechanism.

### OPTIONS

[--patch]
: Only perform patch updates.

[--minor]
: Only perform minor updates.

[--major]
: Only perform major updates.

[--stable]
: Update to the latest stable release. Skips update check.

[--nightly]
: Update to the latest built version of the master branch. Potentially unstable.

[--yes]
: Do not prompt for confirmation.

[--insecure]
: Retry without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

### EXAMPLES

    # Update CLI.
    $ wp cli update
    You are currently using WP-CLI version 0.24.0. Would you like to update to 0.24.1? [y/n] y
    Downloading from https://github.com/wp-cli/wp-cli/releases/download/v0.24.1/wp-cli-0.24.1.phar...
    New version works. Proceeding to replace.
    Success: Updated WP-CLI to 0.24.1.


