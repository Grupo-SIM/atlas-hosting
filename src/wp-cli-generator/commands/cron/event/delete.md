# wp cron event delete

Deletes all scheduled cron events for the given hook.

### OPTIONS

[<hook>...]
: One or more hooks to delete.

[--due-now]
: Delete all hooks due right now.

[--exclude=<hooks>]
: Comma-separated list of hooks to exclude.

[--all]
: Delete all hooks.

### EXAMPLES

    # Delete all scheduled cron events for the given hook
    $ wp cron event delete cron_test
    Success: Deleted a total of 2 cron events.


