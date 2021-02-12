const { performOperation } = require('./helpers');

function getWatchlist(dbClient, guild) {
  return dbClient.db().collection(`watchlist-${guild.id}`);
}

async function getWatchedIDs(dbClient, guild) {
  return (await getWatchlist(dbClient, guild).find().toArray()).map((c) => c._id);
}

async function index(message) {
  return await performOperation(async (dbClient) => {
    const channelsToWatch = await getWatchedIDs(dbClient, message.guild);
    console.log(channelsToWatch);

    if(channelsToWatch.length === 0) {
      message.channel.send('No channels are currently being watched');
    } else {
      const channels = await Promise.all(
        channelsToWatch.map((channelID) => {
          return message.guild.channels.resolve(channelID);
        })
      );

      message.channel.send(`Channels being watched: ${channels.filter((channel) => !!channel).join(", ")}`)
    }
  });
}

async function create(message, channel) {
  return await performOperation(async (dbClient) => {
    await getWatchlist(dbClient, message.guild).insertOne({
      _id: channel.id
    });

    message.channel.send(`Added channel ${channel.toString()} to the watch list`);
  });
}

async function destroy(message, channel) {
  return await performOperation(async (dbClient) => {
    await getWatchlist(dbClient, message.guild).deleteOne({
      _id: channel.id
    })
      
    message.channel.send(`Removed channel ${channel.toString()} from the watch list`);
  });
}

module.exports = { index, create, destroy, getWatchlist };
