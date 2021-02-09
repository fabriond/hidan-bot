const Config = require('./config');
const dbChannels = require('./db/channels');

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

async function setLogChannel(message, channelID) {
  const channel = await getVoiceChannel(message.guild, channelID);

  Config.logChannelID = channel.id;
  message.channel.send(`Set channel ${channel.toString()} as the log channel`);
}

async function setPrefix(message, newPrefix) {
  if(newPrefix.length < 3) throw Error('Prefix can\'t be under 3 characters long');
  else if(newPrefix.length > 8) throw Error('Prefix can\'t be over 8 characters long');

  Config.prefix = newPrefix;
  message.channel.send(`Set prefix to: \`${newPrefix}\``)
}

async function resetPrefix(message) {
  setPrefix(message, Config.getDefaultPrefix());
}

async function sendHelpMessage(message) {
  message.channel.send(
    `List of commands: \n`
    + `\`${Config.prefix}watch <channel_id>\` - adds voice channel to the watch list, making them private as soon as they're full and visible otherwise\n`
    + `\`${Config.prefix}stop watching <channel_id>\` - removes voice channel from the watch list\n`
    + `\`${Config.prefix}list watched\` - lists all watched channels\n`
  )
}

module.exports = {
  'watch': addChannel,
  'stop watching': removeChannel,
  'list watched': listWatched,
  'set log channel': setLogChannel,
  'set prefix': setPrefix,
  'reset prefix': resetPrefix,
  'help': sendHelpMessage,
}