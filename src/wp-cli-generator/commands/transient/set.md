# wp transient set

Sets a transient value.

`<expiration>` is the time until expiration, in seconds.

For a more complete explanation of the transient cache, including the network|site cache, please see docs for `wp transient`.

### OPTIONS

<key>
: Key for the transient.

<value>
: Value to be set for the transient.

[<expiration>]
: Time until expiration, in seconds.

[--network]
: Set the value of a network|site transient. On single site, this is is a specially-named cache key. On multisite, this is a global cache (instead of local to the site).

### EXAMPLES

    $ wp transient set sample_key "test data" 3600
    Success: Transient added.


