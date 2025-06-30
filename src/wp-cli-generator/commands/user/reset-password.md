# wp user reset-password

Resets the password for one or more users.

### OPTIONS

<user>...
: one or more user logins or IDs.

[--skip-email]
: Don't send an email notification to the affected user(s).

[--show-password]
: Show the new password(s).

[--porcelain]
: Output only the new password(s).

### EXAMPLES

    # Reset the password for two users and send them the change email.
    $ wp user reset-password admin editor
    Reset password for admin.
    Reset password for editor.
    Success: Passwords reset for 2 users.

    # Reset and display the password.
    $ wp user reset-password editor --show-password
    Reset password for editor.
    Password: N6hAau0fXZMN#rLCIirdEGOh
    Success: Password reset for 1 user.

    # Reset the password for one user, displaying only the new password, and not sending the change email.
    $ wp user reset-password admin --skip-email --porcelain
    yV6BP*!d70wg

    # Reset password for all users.
    $ wp user reset-password $(wp user list --format=ids)
    Reset password for admin.
    Reset password for editor.
    Reset password for subscriber.
    Success: Passwords reset for 3 users.

    # Reset password for all users with a particular role.
    $ wp user reset-password $(wp user list --format=ids --role=administrator)
    Reset password for admin.
    Success: Password reset for 1 user.


