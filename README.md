# Hidan Bot
Hidan bot watches over discord voice channels (specifically set by the server's admins) and hides them (by making them private) when they're full, but visible otherwise

## Bot prefix
Hidan bot uses the "Hidan," prefix by default. 
So far prefixes can only be set globally (and any changes to it would only stay in effect until the next deploy). 
Pull requests to add the prefix change by server are welcome.

## List of commands
- watch <channel_id> - adds voice channel to the watch list, making them private as soon as they're full and visible otherwise
- stop watching <channel_id> - removes voice channel from the watch list
- list watched - lists all watched channels
- help - displays the list of commands

