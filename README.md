# Hidan Bot
Hidan bot watches over discord voice channels (specifically set by the server's admins) and hides them (by making them private) when they're full, but visible otherwise

## Command prefix
Hidan bot uses the "Hidan," prefix by default, but prefixes can be changed using the "set prefix" and "reset prefix" commands shown below.

## List of commands
- watch <channel_id> - adds voice channel to the watch list, making them private as soon as they're full and visible otherwise
- stop watching <channel_id> - removes voice channel from the watch list
- list watched - lists all watched channels
- set prefix <new_prefix> - changes current prefix for the server (default prefix always works regardless of the prefix chosen)
- reset prefix - removes custom prefix for the server, so that only the default prefix is recognized
- help - displays the list of commands

