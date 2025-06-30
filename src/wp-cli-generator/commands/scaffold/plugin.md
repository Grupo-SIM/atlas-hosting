# wp scaffold plugin

Generates starter code for a plugin.

The following files are always generated:

* `plugin-slug.php` is the main PHP plugin file.
* `readme.txt` is the readme file for the plugin.
* `package.json` needed by NPM holds various metadata relevant to the project. Packages: `grunt`, `grunt-wp-i18n` and `grunt-wp-readme-to-markdown`. Scripts: `start`, `readme`, `i18n`.
* `Gruntfile.js` is the JS file containing Grunt tasks. Tasks: `i18n` containing `addtextdomain` and `makepot`, `readme` containing `wp_readme_to_markdown`.
* `.editorconfig` is the configuration file for Editor.
* `.gitignore` tells which files (or patterns) git should ignore.
* `.distignore` tells which files and folders should be ignored in distribution.

The following files are also included unless the `--skip-tests` is used:

* `phpunit.xml.dist` is the configuration file for PHPUnit.
* `.circleci/config.yml` is the configuration file for CircleCI. Use `--ci=<provider>` to select a different service.
* `bin/install-wp-tests.sh` configures the WordPress test suite and a test database.
* `tests/bootstrap.php` is the file that makes the current plugin active when running the test suite.
* `tests/test-sample.php` is a sample file containing test cases.
* `.phpcs.xml.dist` is a collection of PHP_CodeSniffer rules.

### OPTIONS

<slug>
: The internal name of the plugin.

[--dir=<dirname>]
: Put the new plugin in some arbitrary directory path. Plugin directory will be path plus supplied slug.

[--plugin_name=<title>]
: What to put in the 'Plugin Name:' header.

[--plugin_description=<description>]
: What to put in the 'Description:' header.

[--plugin_author=<author>]
: What to put in the 'Author:' header.

[--plugin_author_uri=<url>]
: What to put in the 'Author URI:' header.

[--plugin_uri=<url>]
: What to put in the 'Plugin URI:' header.

[--skip-tests]
: Don't generate files for unit testing.

[--ci=<provider>]
: Choose a configuration file for a continuous integration provider.
---
default: circle
options:
  - circle
  - gitlab
  - bitbucket
  - github
---

[--activate]
: Activate the newly generated plugin.

[--activate-network]
: Network activate the newly generated plugin.

[--force]
: Overwrite files that already exist.

### EXAMPLES

    $ wp scaffold plugin sample-plugin
    Success: Created plugin files.
    Success: Created test files.


