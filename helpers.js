const Config = require("./config");
const client = Config.getDiscordClient();

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

module.exports = { checkFor, logChannelMessage }