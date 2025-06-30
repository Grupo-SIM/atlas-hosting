# wp language plugin install

Installs a given language for a plugin.

Downloads the language pack from WordPress.org.

### OPTIONS

[<plugin>]
: Plugin to install language for.

[--all]
: If set, languages for all plugins will be installed.

<language>...
: Language code to install.

[--format=<format>]
: Render output in a particular format. Used when installing languages for all plugins.
---
default: table
options:
  - table
  - csv
  - json
  - summary
---

### EXAMPLES

    # Install the Japanese language for Akismet.
    $ wp language plugin install akismet ja
    Downloading translation from https://downloads.wordpress.org/translation/plugin/akismet/4.0.3/ja.zip...
    Unpacking the update...
    Installing the latest version...
    Removing the old version of the translation...
    Translation updated successfully.
    Language 'ja' installed.
    Success: Installed 1 of 1 languages.


