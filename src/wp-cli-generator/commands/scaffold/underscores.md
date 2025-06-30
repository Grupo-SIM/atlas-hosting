# wp scaffold underscores

Generates starter code for a theme based on _s.

See the [Underscores website](https://underscores.me/) for more details.

### OPTIONS

<slug>
: The slug for the new theme, used for prefixing functions.

[--activate]
: Activate the newly downloaded theme.

[--enable-network]
: Enable the newly downloaded theme for the entire network.

[--theme_name=<title>]
: What to put in the 'Theme Name:' header in 'style.css'.

[--author=<full-name>]
: What to put in the 'Author:' header in 'style.css'.

[--author_uri=<uri>]
: What to put in the 'Author URI:' header in 'style.css'.

[--sassify]
: Include stylesheets as SASS.

[--woocommerce]
: Include WooCommerce boilerplate files.

[--force]
: Overwrite files that already exist.

### EXAMPLES

    # Generate a theme with name "Sample Theme" and author "John Doe"
    $ wp scaffold _s sample-theme --theme_name="Sample Theme" --author="John Doe"
    Success: Created theme 'Sample Theme'.


