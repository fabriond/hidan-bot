const { getWatchlist } = require('./db/channels');

function checkFor(text, messageContent, throwError) {
  if(messageContent.startsWith(text)) {
    return messageContent.replace(text, '').trim();
  } else if(throwError) {
    throw Error(`Invalid command ${messageContent}`);
  } else {
    return null;
  }
}

async function toggleChannelState(dbClient, channel) {
  const isChannelWatched = !!(await getWatchlist(dbClient, channel.guild).findOne({_id: channel.id}));

  if(!isChannelWatched) return;
  
  if(channel.full) {
    console.log(`${channel} is full, hiding it`)
    channel.overwritePermissions([
      {
        id: channel.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      }
    ], 'Channel is full');
  } else {
    console.log(`${channel} is not full, displaying it`)
    channel.overwritePermissions([
      {
        id: channel.guild.roles.everyone,
        allow: ['VIEW_CHANNEL'],
      }
    ], 'Channel is not full');
  }
}

module.exports = { checkFor, toggleChannelState }