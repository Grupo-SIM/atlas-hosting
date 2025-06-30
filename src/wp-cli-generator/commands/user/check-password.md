# wp user check-password

Checks if a user's password is valid or not.

### OPTIONS

<user>
: The user login, user email or user ID of the user to check credentials for.

<user_pass>
: A string that contains the plain text password for the user.

[--escape-chars]
: Escape password with `wp_slash()` to mimic the same behavior as `wp-login.php`.

### EXAMPLES

    # Check whether given credentials are valid; exit status 0 if valid, otherwise 1
    $ wp user check-password admin adminpass
    $ echo $?
    1

    # Bash script for checking whether given credentials are valid or not
    if ! $(wp user check-password admin adminpass); then
     notify-send "Invalid Credentials";
    fi


