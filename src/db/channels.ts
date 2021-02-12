import { MongoClient } from 'mongodb';
import { Guild, Message, VoiceChannel } from 'discord.js';
import { performOperation } from './helpers';

function getWatchlist(dbClient: MongoClient, guild: Guild) {
  return dbClient.db().collection(`watchlist-${guild.id}`);
}

async function getWatchedIDs(dbClient: MongoClient, guild: Guild) {
  return (await getWatchlist(dbClient, guild).find().toArray()).map((c) => c._id);
}

async function index(message: Message) {
  return await performOperation(message, async (dbClient, guild) => {    
    const channelsToWatch = await getWatchedIDs(dbClient, guild);
    console.log(channelsToWatch);

    if(channelsToWatch.length === 0) {
      message.channel.send('No channels are currently being watched');
    } else {
      const channels = await Promise.all(
        channelsToWatch.map((channelID) => {
          return guild.channels.resolve(channelID);
        })
      );

      message.channel.send(`Channels being watched: ${channels.filter((c) => !!c).join(", ")}`)
    }
  });
}

async function create(message: Message, channel: VoiceChannel) {
  return await performOperation(message, async (dbClient, guild) => {
    await getWatchlist(dbClient, guild).insertOne({
      _id: channel.id
    });

    message.channel.send(`Added channel ${channel.toString()} to the watch list`);
  });
}

async function destroy(message: Message, channel: VoiceChannel) {
  return await performOperation(message, async (dbClient, guild) => {
    await getWatchlist(dbClient, guild).deleteOne({
      _id: channel.id
    })
      
    message.channel.send(`Removed channel ${channel.toString()} from the watch list`);
  });
}

export { index, create, destroy, getWatchlist };
