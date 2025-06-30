# wp core verify-checksums

Verifies WordPress files against WordPress.org's checksums.

This command runs on the `before_wp_load` hook, just before the WP load process begins.

Downloads md5 checksums for the current version from WordPress.org, and compares those checksums against the currently installed files.

For security, avoids loading WordPress when verifying checksums.

If you experience issues verifying from this command, ensure you are passing the relevant `--locale` and `--version` arguments according to the values from the `Dashboard->Updates` menu in the admin area of the site.

### OPTIONS

[--include-root]
: Verify all files and folders in the root directory, and warn if any non-WordPress items are found.

[--version=<version>]
: Verify checksums against a specific version of WordPress.

[--locale=<locale>]
: Verify checksums against a specific locale of WordPress.

[--insecure]
: Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

[--exclude=<files>]
: Exclude specific files from the checksum verification. Provide a comma-separated list of file paths.

### EXAMPLES

    # Verify checksums
    $ wp core verify-checksums
    Success: WordPress installation verifies against checksums.

    # Verify checksums for given WordPress version
    $ wp core verify-checksums --version=4.0
    Success: WordPress installation verifies against checksums.

    # Verify checksums for given locale
    $ wp core verify-checksums --locale=en_US
    Success: WordPress installation verifies against checksums.

    # Verify checksums for given locale
    $ wp core verify-checksums --locale=ja
    Warning: File doesn't verify against checksum: wp-includes/version.php
    Warning: File doesn't verify against checksum: readme.html
    Warning: File doesn't verify against checksum: wp-config-sample.php
    Error: WordPress installation doesn't verify against checksums.

    # Verify checksums and exclude files
    $ wp core verify-checksums --exclude="readme.html"
    Success: WordPress installation verifies against checksums.


