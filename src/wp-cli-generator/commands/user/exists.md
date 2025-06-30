# wp user exists

Verifies whether a user exists.

Displays a success message if the user does exist.

### OPTIONS

<id>
: The ID of the user to check.

### EXAMPLES

    # The user exists.
    $ wp user exists 1337
    Success: User with ID 1337 exists.
    $ echo $?
    0

    # The user does not exist.
    $ wp user exists 10000
    $ echo $?
    1


