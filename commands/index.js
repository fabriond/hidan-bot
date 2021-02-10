const Config = require('../config');
const { addChannel, removeChannel, listWatched } = require('./channels');
const { setPrefix, resetPrefix } = require('./guild_config');

const ADD_CHANNEL = 'watch';
const REMOVE_CHANNEL = 'stop watching';
const LIST_CHANNELS = 'list watched';
const CHANGE_PREFIX = 'set prefix';
const RESET_PREFIX = 'reset prefix';
const DISPLAY_HELP = 'help';

async function sendHelpMessage(message) {
  const prefix = Config.getDefaultPrefix();
  message.channel.send(
    `List of commands: \n`
    + `\`${prefix} ${ADD_CHANNEL} <channel_id>\` - adds voice channel to the watch list, making them private as soon as they're full and visible otherwise\n`
    + `\`${prefix} ${REMOVE_CHANNEL} <channel_id>\` - removes voice channel from the watch list\n`
    + `\`${prefix} ${LIST_CHANNELS}\` - lists all watched channels\n`
    + `\`${prefix} ${CHANGE_PREFIX} <new_prefix>\` - changes the server prefix (the default prefix always works regardless of the server prefix)`
    + `\`${prefix} ${RESET_PREFIX}\` - removes server prefix, so that only the default prefix is recognized`
    + `\`${prefix} ${DISPLAY_HELP}\` - displays the list of commands`
  )
}

module.exports = {
  [ADD_CHANNEL]: addChannel,
  [REMOVE_CHANNEL]: removeChannel,
  [LIST_CHANNELS]: listWatched,
  [CHANGE_PREFIX]: setPrefix,
  [RESET_PREFIX]: resetPrefix,
  [DISPLAY_HELP]: sendHelpMessage,
}