const Config = require('./config');
const dbChannels = require('./db/channels');
const { setGuildConfigs } = require('./db/guild_config');

async function getVoiceChannel(guild, channelID) {
  const channel = await guild.channels.resolve(channelID);
  if(!channel) throw Error('Channel not found');
  if(channel.isText()) throw Error('Text channels not allowed');
  
  return channel;
}

async function addChannel(message, channelID) {
  const channel = await getVoiceChannel(message.guild, channelID);

  await dbChannels.create(message, channel);
}

async function removeChannel(message, channelID) {
  const channel = await getVoiceChannel(message.guild, channelID);

  await dbChannels.destroy(message, channel);
}

async function listWatched(message) {
  await dbChannels.index(message);
}

async function setPrefix(message, newPrefix) {
  if(newPrefix.length < 3) throw Error('Prefix can\'t be under 3 characters long');
  else if(newPrefix.length > 8) throw Error('Prefix can\'t be over 8 characters long');

  setGuildConfigs(message, { prefix: newPrefix });
}

async function resetPrefix(message) {
  setPrefix(message, Config.getDefaultPrefix());
}

async function sendHelpMessage(message) {
  const prefix = Config.getDefaultPrefix();
  message.channel.send(
    `List of commands: \n`
    + `\`${prefix} watch <channel_id>\` - adds voice channel to the watch list, making them private as soon as they're full and visible otherwise\n`
    + `\`${prefix} stop watching <channel_id>\` - removes voice channel from the watch list\n`
    + `\`${prefix} list watched\` - lists all watched channels\n`
    + `\`${prefix} set prefix <new_prefix>\` - changes the server prefix (the default prefix always works regardless of the server prefix)`
    + `\`${prefix} reset prefix\` - removes server prefix, so that only the default prefix is recognized`
    + `\`${prefix} help\` - displays the list of commands`
  )
}

module.exports = {
  'watch': addChannel,
  'stop watching': removeChannel,
  'list watched': listWatched,
  'set prefix': setPrefix,
  'reset prefix': resetPrefix,
  'help': sendHelpMessage,
}