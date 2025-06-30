# wp scaffold child-theme

Generates child theme based on an existing theme.

Creates a child theme folder with `functions.php` and `style.css` files.

### OPTIONS

<slug>
: The slug for the new child theme.

--parent_theme=<slug>
: What to put in the 'Template:' header in 'style.css'.

[--theme_name=<title>]
: What to put in the 'Theme Name:' header in 'style.css'.

[--author=<full-name>]
: What to put in the 'Author:' header in 'style.css'.

[--author_uri=<uri>]
: What to put in the 'Author URI:' header in 'style.css'.

[--theme_uri=<uri>]
: What to put in the 'Theme URI:' header in 'style.css'.

[--activate]
: Activate the newly created child theme.

[--enable-network]
: Enable the newly created child theme for the entire network.

[--force]
: Overwrite files that already exist.

### EXAMPLES

    # Generate a 'sample-theme' child theme based on TwentySixteen
    $ wp scaffold child-theme sample-theme --parent_theme=twentysixteen
    Success: Created '/var/www/example.com/public_html/wp-content/themes/sample-theme'.


