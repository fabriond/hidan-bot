const Config = require('../config');
const mongoClient = Config.getMongoClient;
const { handleDbError } = require('../helpers');

function configsCollection(dbClient) {
  return dbClient.db().collection('guild_configs');
}

async function getConfigs(message) {
  let dbClient;

  try {
    dbClient = await mongoClient().connect();

    const configs = await configsCollection(dbClient).findOne({ _id: message.guild.id });

    return configs;
  } catch(error) {
    handleDbError(error, message.channel);
  } finally {
    if(dbClient) await dbClient.close();
  }
}

async function setConfigs(message, newConfigs) {
  let dbClient;

  try {
    dbClient = await mongoClient().connect();

    await configsCollection(dbClient).findOneAndUpdate(
      { _id: message.guild.id }, 
      { $set: newConfigs }
    );

    for(const config in newConfigs) {
      if(!newConfigs.hasOwnProperty(config)) continue;
      message.channel.send(`Set ${config} to: \`${newConfigs[config]}\``);
    }
  } catch(error) {
    handleDbError(error, message.channel);
  } finally {
    await dbClient.close();
  }
}

module.exports = { getConfigs, setConfigs };