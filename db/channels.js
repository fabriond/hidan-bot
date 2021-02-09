const Config = require('../config');
const dbClient = Config.getMongoClient();
const helpers = require('../helpers');

async function index(message) {
  await dbClient.connect(async (error) => {
    if(error) helpers.handleDbError(error);
    
    const channelsToWatch = await helpers.getWatchedIDs(message.guild.id);
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

  try {
    await dbClient.connect();

    await helpers.getWatchlist(message.guild.id).insertOne({
      _id: channel.id
    });

    message.channel.send(`Added channel ${channel.toString()} to the watch list`);
  } catch(error) {
    helpers.handleDbError(error, message.channel)
  } finally {
    await dbClient.close();
  }

  // await dbClient.connect(async (error) => {
  //   if(error) helpers.handleDbError(error, message.channel);
    
  //   try{
  //     await helpers.getWatchlist(message.guild.id).insertOne({
  //       _id: channel.id
  //     })
      
  //     message.channel.send(`Added channel ${channel.toString()} to the watch list`);
  //   } catch(error) {
  //     helpers.handleDbError(error, message.channel)
  //   }
  // });
}

async function destroy(message, channel) {
  await dbClient.connect(async (error) => {
    if(error) helpers.handleDbError(error, message.channel);
    
    try {
      await helpers.getWatchlist(message.guild.id).deleteOne({
        _id: channel.id
      })
        
      message.channel.send(`Removed channel ${channel.toString()} from the watch list`);
    } catch(error) {
      helpers.handleDbError(error, message.channel);
    }
  });
}

module.exports = { index, create, destroy };
