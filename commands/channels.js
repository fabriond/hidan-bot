const dbChannels = require('../db/channels');

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

module.exports = { addChannel, removeChannel, listWatched };