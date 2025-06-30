# wp core update

Updates WordPress to a newer version.

Defaults to updating WordPress to the latest version.

If you see "Error: Another update is currently in progress.", you may need to run `wp option delete core_updater.lock` after verifying another update isn't actually running.

### OPTIONS

[<zip>]
: Path to zip file to use, instead of downloading from wordpress.org.

[--minor]
: Only perform updates for minor releases (e.g. update from WP 4.3 to 4.3.3 instead of 4.4.2).

[--version=<version>]
: Update to a specific version, instead of to the latest version. Alternatively accepts 'nightly'.

[--force]
: Update even when installed WP version is greater than the requested version.

[--locale=<locale>]
: Select which language you want to download.

[--insecure]
: Retry download without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

### EXAMPLES

    # Update WordPress
    $ wp core update
    Updating to version 4.5.2 (en_US)...
    Downloading update from https://downloads.wordpress.org/release/wordpress-4.5.2-no-content.zip...
    Unpacking the update...
    Cleaning up files...
    No files found that need cleaning up
    Success: WordPress updated successfully.

    # Update WordPress using zip file.
    $ wp core update ../latest.zip
    Starting update...
    Unpacking the update...
    Success: WordPress updated successfully.

    # Update WordPress to 3.1 forcefully
    $ wp core update --version=3.1 --force
    Updating to version 3.1 (en_US)...
    Downloading update from https://wordpress.org/wordpress-3.1.zip...
    Unpacking the update...
    Warning: Checksums not available for WordPress 3.1/en_US. Please cleanup files manually.
    Success: WordPress updated successfully.


