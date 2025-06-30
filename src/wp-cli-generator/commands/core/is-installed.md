# wp core is-installed

Checks if WordPress is installed.

Determines whether WordPress is installed by checking if the standard database tables are installed. Doesn't produce output; uses exit codes to communicate whether WordPress is installed.

### OPTIONS

[--network]
: Check if this is a multisite installation.

### EXAMPLES

    # Bash script for checking if WordPress is not installed.

    if ! wp core is-installed 2>/dev/null; then
        # WP is not installed. Let's try installing it.
        wp core install
    fi

    # Bash script for checking if WordPress is installed, with fallback.

    if wp core is-installed 2>/dev/null; then
        # WP is installed. Let's do some things we should only do in a confirmed WP environment.
        wp core verify-checksums
    else
        # Fallback if WP is not installed.
        echo 'Hey Friend, you are in the wrong spot. Move in to your WordPress directory and try again.'
    fi


