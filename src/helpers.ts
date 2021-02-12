import { VoiceChannel } from 'discord.js';
import { MongoClient } from 'mongodb';
import { getWatchlist } from './db/channels';

function checkFor(text: string, messageContent: string, throwError = false) {
  if(messageContent.startsWith(text)) {
    return messageContent.replace(text, '').trim();
  } else if(throwError) {
    throw Error(`Invalid command ${messageContent}`);
  } else {
    return null;
  }
}

async function toggleChannelState(dbClient: MongoClient, channel: VoiceChannel) {
  const isChannelWatched = !!(await getWatchlist(dbClient, channel.guild).findOne({_id: channel.id}));

  if(!isChannelWatched) return;
  
  if(channel.full) {
    console.log(`${channel} is full, hiding it`)
    channel.overwritePermissions([
      {
        id: channel.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      }
    ], 'Channel is full');
  } else {
    console.log(`${channel} is not full, displaying it`)
    channel.overwritePermissions([
      {
        id: channel.guild.roles.everyone,
        allow: ['VIEW_CHANNEL'],
      }
    ], 'Channel is not full');
  }
}

export { checkFor, toggleChannelState }