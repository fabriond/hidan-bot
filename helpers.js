const Config = require("./config");
const client = Config.getDiscordClient();

function handleDbError(error, replyChannel) {
  if(replyChannel) replyChannel.send(error.message);
  else console.log(error.message);

  throw error;
}

async function logChannelMessage(content) {
  if(!Config.logChannelID) return;

  try {
    const logChannel = await client.channels.fetch(Config.logChannelID);
    logChannel.send(content);
  } catch(error) {
    console.log(error);
  }
}

function checkFor(text, messageContent, throwError) {
  if(messageContent.startsWith(text)) {
    return messageContent.replace(text, '').trim();
  } else if(throwError) {
    throw Error(`Invalid command ${messageContent}`);
  } else {
    return null;
  }
}

function getWatchlist(dbClient, guildID) {
  return dbClient.db().collection(`watchlist-${guildID}`);
}

async function getWatchedIDs(dbClient, guildID) {
  return (await getWatchlist(dbClient, guildID).find().toArray()).map((c) => c._id);
}

module.exports = { checkFor, handleDbError, logChannelMessage, getWatchlist, getWatchedIDs }