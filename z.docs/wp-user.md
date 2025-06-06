"NAME

  wp user

DESCRIPTION

  Manages users, along with their roles, capabilities, and meta.

SYNOPSIS

  wp user <command>

SUBCOMMANDS

  add-cap                   Adds a capability to a user.
  add-role                  Adds a role for a user.
  application-password      Creates, updates, deletes, lists and retrieves
                            application passwords.
  check-password            Checks if a user's password is valid or not.
  create                    Creates a new user.
  delete                    Deletes one or more users from the current site.
  exists                    Verifies whether a user exists.
  generate                  Generates some users.
  get                       Gets details about a user.
  import-csv                Imports users from a CSV file.
  list                      Lists users.
  list-caps                 Lists all capabilities for a user.
  meta                      Adds, updates, deletes, and lists user custom
                            fields.
  remove-cap                Removes a user's capability.
  remove-role               Removes a user's role.
  reset-password            Resets the password for one or more users.
  session                   Destroys and lists a user's sessions.
  set-role                  Sets the user role.
  signup                    Manages signups on a multisite installation.
  spam                      Marks one or more users as spam on multisite.
  term                      Adds, updates, removes, and lists user terms.
  unspam                    Removes one or more users from spam on multisite.
  update                    Updates an existing user.

  See references for [Roles and Capabilities][1] and [WP User class][2].

  ---
  [1] https://codex.wordpress.org/Roles_and_Capabilities
  [2] https://codex.wordpress.org/Class_Reference/WP_User

EXAMPLES

    # List user IDs
    $ wp user list --field=ID
    1

    # Create a new user.
    $ wp user create bob bob@example.com --role=author
    Success: Created user 3.
    Password: k9**&I4vNH(&

    # Update an existing user.
    $ wp user update 123 --display_name=Mary --user_pass=marypass
    Success: Updated user 123.

    # Delete user 123 and reassign posts to user 567
    $ wp user delete 123 --reassign=567
    Success: Removed user 123 from http://example.com.

GLOBAL PARAMETERS

  --path=<path>
      Path to the WordPress files.

  --url=<url>
      Pretend request came from given URL. In multisite, this argument is how
      the target site is specified.

  --ssh=[<scheme>:][<user>@]<host|container>[:<port>][<path>]
      Perform operation against a remote server over SSH (or a container using
      scheme of \"docker\", \"docker-compose\", \"docker-compose-run\", \"vagrant\").

  --http=<http>
      Perform operation against a remote WordPress installation over HTTP.

  --user=<id|login|email>
      Set the WordPress user.

  --skip-plugins[=<plugins>]
      Skip loading all plugins, or a comma-separated list of plugins. Note:
      mu-plugins are still loaded.

  --skip-themes[=<themes>]
      Skip loading all themes, or a comma-separated list of themes.

  --skip-packages
      Skip loading all installed packages.

  --require=<path>
      Load PHP file before running the command (may be used more than once).

  --exec=<php-code>
      Execute PHP code before running the command (may be used more than once).

  --context=<context>
      Load WordPress in a given context.

  --[no-]color
      Whether to colorize the output.

  --debug[=<group>]
      Show all PHP errors and add verbosity to WP-CLI output. Built-in groups
      include: bootstrap, commandfactory, and help.

  --prompt[=<assoc>]
      Prompt the user to enter values for all command arguments, or a subset
      specified as comma-separated values.

  --quiet
      Suppress informational messages.

"