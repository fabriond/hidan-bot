const Config = require('../config');
const mongoClient = Config.getMongoClient;
const helpers = require('../helpers');

async function index(message) {

  let dbClient;

  try {
    dbClient = await mongoClient().connect();

    const channelsToWatch = await helpers.getWatchedIDs(dbClient, message.guild.id);
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
  } catch(error) {
    helpers.handleDbError(error, message.channel)
  } finally {
    if(dbClient) await dbClient.close();
  }
}

async function create(message, channel) {

  let dbClient;

  try {
    dbClient = await mongoClient().connect();

    await helpers.getWatchlist(dbClient, message.guild.id).insertOne({
      _id: channel.id
    });

    message.channel.send(`Added channel ${channel.toString()} to the watch list`);
  } catch(error) {
    helpers.handleDbError(error, message.channel)
  } finally {
    if(dbClient) await dbClient.close();
  }
}

async function destroy(message, channel) {

  let dbClient;

  try {
    dbClient = await mongoClient().connect();

    await helpers.getWatchlist(dbClient, message.guild.id).deleteOne({
      _id: channel.id
    })
      
    message.channel.send(`Removed channel ${channel.toString()} from the watch list`);
  } catch(error) {
    helpers.handleDbError(error, message.channel);
  } finally {
    if(dbClient) await dbClient.close();
  }
}

module.exports = { index, create, destroy };
