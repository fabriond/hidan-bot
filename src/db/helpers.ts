import { DMChannel, Guild, Message, NewsChannel, TextChannel } from 'discord.js';
import { MongoClient } from 'mongodb';
import { newMongoClient } from '../config';

function handleDbError(error: any, replyChannel: TextChannel | DMChannel | NewsChannel) {
  if(replyChannel) replyChannel.send(error.message);
  else console.log(error.message);

  throw error;
}

async function performOperation(message: Message, operation: (dbClient : MongoClient, guild: Guild) => any) {
  let dbClient;

  const { guild } = message;

  if(!guild) return;

  try {
    dbClient = await newMongoClient().connect();

    return await operation(dbClient, guild);
  } catch(error) {
    handleDbError(error, message.channel);
  } finally {
    if(dbClient) await dbClient.close();
  }
}

async function performSimpleOperation(operation: (dbClient : MongoClient) => any) {
  let dbClient;

  try {
    dbClient = await newMongoClient().connect();

    return await operation(dbClient);
  } catch(error) {
    console.log(error);
  } finally {
    if(dbClient) await dbClient.close();
  }
}

export { performOperation, performSimpleOperation, handleDbError }