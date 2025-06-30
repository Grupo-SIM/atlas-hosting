# wp cron event unschedule

Unschedules all cron events for a given hook.

### OPTIONS

<hook>
: Name of the hook for which all events should be unscheduled.

### EXAMPLES

    # Unschedule a cron event on given hook.
    $ wp cron event unschedule cron_test
    Success: Unscheduled 2 events for hook 'cron_test'.


