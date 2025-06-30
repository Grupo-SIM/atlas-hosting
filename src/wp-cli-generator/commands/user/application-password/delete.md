# wp user application-password delete

Delete an existing application password.

### OPTIONS

<user>
: The user login, user email, or user ID of the user to delete the application password for.

[<uuid>...]
: Comma-separated list of UUIDs of the application passwords to delete.

[--all]
: Delete all of the user's application password.

### EXAMPLES

    # Delete an existing application password
    $ wp user application-password delete 123 6633824d-c1d7-4f79-9dd5-4586f734d69e
    Success: Deleted 1 of 1 application password.

    # Delete all of the user's application passwords
    $ wp user application-password delete 123 --all
    Success: Deleted all application passwords.


