import { Guild, GuildChannelResolvable, Message, VoiceChannel } from 'discord.js';
import * as dbChannels from '../db/channels';

async function getVoiceChannel(guild: Guild, channelID: GuildChannelResolvable) {
  const channel = await guild.channels.resolve(channelID);
  if(!channel) throw Error('Channel not found');
  if(channel.isText()) throw Error('Text channels not allowed');
  
  return channel as VoiceChannel;
}

async function addChannel(message: Message, channelID: GuildChannelResolvable) {
  if(!message.guild) return;
  const channel = await getVoiceChannel(message.guild, channelID);

  await dbChannels.create(message, channel);
}

async function removeChannel(message: Message, channelID: GuildChannelResolvable) {
  if(!message.guild) return;
  const channel = await getVoiceChannel(message.guild, channelID);

  await dbChannels.destroy(message, channel);
}

async function listWatched(message: Message) {
  await dbChannels.index(message);
}

export { addChannel, removeChannel, listWatched };