const { performOperation } = require('./helpers');

function configsCollection(dbClient) {
  return dbClient.db().collection('guild_configs');
}

async function getConfigs(message) {
  return await performOperation((dbClient) => {
    const configs = await configsCollection(dbClient).findOne({ _id: message.guild.id });

    return configs;
  });
}

async function setConfigs(message, newConfigs) {
  return await performOperation((dbClient) => {
    const configs = await configsCollection(dbClient).findOne({ _id: message.guild.id });

    if(configs) {
      await configsCollection(dbClient).findOneAndUpdate(
        { _id: message.guild.id }, 
        { $set: newConfigs }
      );
    } else {
      await configsCollection(dbClient).insertOne(
        Object.assign({}, newConfigs, { _id: message.guild.id })
      );
    }

    for(const config in newConfigs) {
      if(!newConfigs.hasOwnProperty(config)) continue;
      message.channel.send(`Set ${config} to: \`${newConfigs[config]}\``);
    }
  });
}

module.exports = { getConfigs, setConfigs };