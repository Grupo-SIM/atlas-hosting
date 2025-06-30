# wp user add-cap

Adds a capability to a user.

### OPTIONS

<user>
: User ID, user email, or user login.

<cap>
: The capability to add.

### EXAMPLES

    # Add a capability for a user
    $ wp user add-cap john create_premium_item
    Success: Added 'create_premium_item' capability for john (16).

    # Add a capability for a user
    $ wp user add-cap 15 edit_product
    Success: Added 'edit_product' capability for johndoe (15).


