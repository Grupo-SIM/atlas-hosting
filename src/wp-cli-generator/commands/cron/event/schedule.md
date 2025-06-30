# wp cron event schedule

Schedules a new cron event.

### OPTIONS

<hook>
: The hook name.

[<next-run>]
: A Unix timestamp or an English textual datetime description compatible with `strtotime()`. Defaults to now.

[<recurrence>]
: How often the event should recur. See `wp cron schedule list` for available schedule names. Defaults to no recurrence.

[--<field>=<value>]
: Arguments to pass to the hook for the event. <field> should be a numeric key, not a string.

### EXAMPLES

    # Schedule a new cron event
    $ wp cron event schedule cron_test
    Success: Scheduled event with hook 'cron_test' for 2016-05-31 10:19:16 GMT.

    # Schedule new cron event with hourly recurrence
    $ wp cron event schedule cron_test now hourly
    Success: Scheduled event with hook 'cron_test' for 2016-05-31 10:20:32 GMT.

    # Schedule new cron event and pass arguments
    $ wp cron event schedule cron_test '+1 hour' --0=first-argument --1=second-argument
    Success: Scheduled event with hook 'cron_test' for 2016-05-31 11:21:35 GMT.


