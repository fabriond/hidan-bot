import { Message } from 'discord.js';
import { MongoClient } from 'mongodb';
import { performOperation } from './helpers';

interface GuildConfigs {
  readonly prefix?: string;
};

function configsCollection(dbClient: MongoClient) {
  return dbClient.db().collection('guild_configs');
}

async function getGuildConfigs(message: Message): Promise<GuildConfigs> {
  return await performOperation(message, async (dbClient, guild) => {
    const configs: GuildConfigs = await configsCollection(dbClient).findOne({ _id: guild.id });

    return configs;
  });
}

async function setGuildConfigs(message: Message, newConfigs: GuildConfigs) {
  return await performOperation(message, async (dbClient, guild) => {
    const configs: GuildConfigs = await configsCollection(dbClient).findOne({ _id: guild.id });

    if(configs) {
      await configsCollection(dbClient).findOneAndUpdate(
        { _id: guild.id }, 
        { $set: newConfigs }
      );
    } else {
      await configsCollection(dbClient).insertOne(
        { ...newConfigs, _id: guild.id }
      );
    }



    for(const config of Object.keys(newConfigs) as Array<keyof GuildConfigs>) {
      if(!newConfigs.hasOwnProperty(config)) continue;
      message.channel.send(`Set ${config} to: \`${newConfigs[config]}\``);
    }
  });
}

export { getGuildConfigs, setGuildConfigs };