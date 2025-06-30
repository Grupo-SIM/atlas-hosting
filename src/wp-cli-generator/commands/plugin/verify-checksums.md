# wp plugin verify-checksums

Verifies plugin files against WordPress.org's checksums.

### OPTIONS

[<plugin>...]
: One or more plugins to verify.

[--all]
: If set, all plugins will be verified.

[--strict]
: If set, even "soft changes" like readme.txt changes will trigger checksum errors.

[--version=<version>]
: Verify checksums against a specific plugin version.

[--format=<format>]
: Render output in a specific format.
---
default: table
options:
  - table
  - json
  - csv
  - yaml
  - count
---

[--insecure]
: Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

[--exclude=<name>]
: Comma separated list of plugin names that should be excluded from verifying.

### EXAMPLES

    # Verify the checksums of all installed plugins
    $ wp plugin verify-checksums --all
    Success: Verified 8 of 8 plugins.

    # Verify the checksums of a single plugin, Akismet in this case
    $ wp plugin verify-checksums akismet
    Success: Verified 1 of 1 plugins.


