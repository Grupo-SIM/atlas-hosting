# wp role reset

Resets any default role to default capabilities.

Uses WordPress' `populate_roles()` function to put one or more roles back into the state they were at in the a fresh WordPress install. Removes any capabilities that were added, and restores any capabilities that were removed. Custom roles are not affected.

### OPTIONS

[<role-key>...]
: The internal name of one or more roles to reset.

[--all]
: If set, all default roles will be reset.

### EXAMPLES

    # Reset three roles.
    $ wp role reset administrator author contributor
    Restored 1 capability to and removed 0 capabilities from 'administrator' role.
    No changes necessary for 'author' role.
    No changes necessary for 'contributor' role.
    Success: 1 of 3 roles reset.

    # Reset a custom role.
    $ wp role reset custom_role
    Custom role 'custom_role' not affected.
    Error: Must specify a default role to reset.

    # Reset all default roles.
    $ wp role reset --all
    Success: All default roles reset.


