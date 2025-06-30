# wp cron event run

Runs the next scheduled cron event for the given hook.

### OPTIONS

[<hook>...]
: One or more hooks to run.

[--due-now]
: Run all hooks due right now.

[--exclude=<hooks>]
: Comma-separated list of hooks to exclude.

[--all]
: Run all hooks.

### EXAMPLES

    # Run all cron events due right now
    $ wp cron event run --due-now
    Executed the cron event 'cron_test_1' in 0.01s.
    Executed the cron event 'cron_test_2' in 0.006s.
    Success: Executed a total of 2 cron events.


