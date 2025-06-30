# wp cache supports

Determines whether the object cache implementation supports a particular feature.

### OPTIONS

<feature>
: Name of the feature to check for.

### EXAMPLES

    # Check whether is add_multiple supported.
    $ wp cache supports add_multiple
    $ echo $?
    0

    # Bash script for checking whether for support like this:
    if ! wp cache supports non_existing; then
        echo 'non_existing is not supported'
    fi


