# wp user application-password exists

Checks whether an application password for a given application exists.

### OPTIONS

<user>
: The user login, user email, or user ID of the user to check the existence of an application password for.

<app-name>
: Name of the application to check the existence of an application password for.

### EXAMPLES

    # Check if an application password for a given application exists
    $ wp user application-password exists 123 myapp
    $ echo $?
    1

    # Bash script for checking whether an application password exists and creating one if not
    if ! wp user application-password exists 123 myapp; then
        PASSWORD=$(wp user application-password create 123 myapp --porcelain)
    fi


