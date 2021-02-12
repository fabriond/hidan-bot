const Config = require('../config');
const mongoClient = Config.getMongoClient;

function handleDbError(error, replyChannel) {
  if(replyChannel) replyChannel.send(error.message);
  else console.log(error.message);

  throw error;
}

async function performOperation(operation = (dbClient) => null) {
  let dbClient;

  try {
    dbClient = await mongoClient().connect();

    return await operation(dbClient);
  } catch(error) {
    handleDbError(error, message.channel);
  } finally {
    if(dbClient) await dbClient.close();
  }
}

module.exports = { performOperation, handleDbError }