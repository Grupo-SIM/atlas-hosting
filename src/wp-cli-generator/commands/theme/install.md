# wp theme install

Installs one or more themes.

### OPTIONS

<theme|zip|url>...
: One or more themes to install. Accepts a theme slug, the path to a local zip file, or a URL to a remote zip file.

[--version=<version>]
: If set, get that particular version from wordpress.org, instead of the stable version.

[--force]
: If set, the command will overwrite any installed version of the theme, without prompting for confirmation.

[--ignore-requirements]
: If set, the command will install the theme while ignoring any WordPress or PHP version requirements specified by the theme authors.

[--activate]
: If set, the theme will be activated immediately after install.

[--insecure]
: Retry downloads without certificate validation if TLS handshake fails. Note: This makes the request vulnerable to a MITM attack.

### EXAMPLES

    # Install the latest version from wordpress.org and activate
    $ wp theme install twentysixteen --activate
    Installing Twenty Sixteen (1.2)
    Downloading install package from http://downloads.wordpress.org/theme/twentysixteen.1.2.zip...
    Unpacking the package...
    Installing the theme...
    Theme installed successfully.
    Activating 'twentysixteen'...
    Success: Switched to 'Twenty Sixteen' theme.
    Success: Installed 1 of 1 themes.

    # Install from a local zip file
    $ wp theme install ../my-theme.zip

    # Install from a remote zip file
    $ wp theme install http://s3.amazonaws.com/bucketname/my-theme.zip?AWSAccessKeyId=123&amp;Expires=456&amp;Signature=abcdef


