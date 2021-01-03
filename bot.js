const Discord = require('discord.js');

const client = new Discord.Client();

let prefix = 'Hidan, ';
let logChannelID;
const channelsToWatch = [];

async function logChannelMessage(content) {
  let logChannel;
  try {
    logChannel = await client.channels.fetch(logChannelID);
    logChannel.send(content);
  } catch(error) {}
}

function checkFor(text, messageContent, callback, trim = true) {
  if(messageContent.startsWith(text)) {
    let result = messageContent.replace(text, '')
    if(trim) result = result.trim();
    callback(result);
  }
}

function addChannel(content, message) {
  checkFor('watch', content, async (channelID) => {
    try {
      const channel = await client.channels.fetch(channelID);
      if(channel.isText()) throw Error('Text channels not allowed');
      if(channelsToWatch.includes(channel.id)) throw Error('Channel already being watched')

      channelsToWatch.push(channel.id);
      message.channel.send(`Added channel ${channel.toString()} to the watch list`);
    } catch(error) {
      message.channel.send(error.message);
    }
  })
}

function removeChannel(content, message) {
  checkFor('stopwatching', content, async (channelID) => {
    try {
      const channel = await client.channels.fetch(channelID);
      if(channel.isText()) throw Error('Text channels not allowed');
      if(!channelsToWatch.includes(channel.id)) throw Error('Channel not being watched')

      const removeIndex = channelsToWatch.indexOf(channel.id);
      channelsToWatch.splice(removeIndex, 1)
      message.channel.send(`Removed channel ${channel.toString()} from the watch list`);
    } catch(error) {
      message.channel.send(error.message);
    }
  })
}

function listWatched(content, message) {
  checkFor('listwatched', content, async () => {
    try {
      if(channelsToWatch.length === 0) throw Error('No channels are currently being watched');

      const channels = await Promise.all(
        channelsToWatch.map((channelID) => {
          return client.channels.fetch(channelID);
        })
      )

      message.channel.send(`Channels being watched: ${channels.join(", ")}`)
    } catch(error) {
      message.channel.send(error.message);
    }
  })
}

function setLog(content, message) {
  checkFor('setlog', content, async (channelID) => {
    try {
      const channel = await client.channels.fetch(channelID);
      if(!channel.isText()) throw Error('Voice channels not allowed');

      logChannel = channel.id;
      message.channel.send(`Set channel ${channel.toString()} as the log channel`);
    } catch(error) {
      message.channel.send(error.message);
    }
  })
}

function setPrefix(content, message) {
  checkFor('setprefix ', content, async (newPrefix) => {
    try {
      if(newPrefix.length > 8) throw Error('Prefix can\'t be over 8 characters');

      prefix = newPrefix;
      message.channel.send(`Set prefix to: \`${newPrefix}\``)
    } catch(error) {
      message.channel.send(error.message);
    }
  }, false)
}

function resetPrefix(content, message) {
  checkFor('resetprefix', content, async () => {
    setPrefix('setprefix Hidan, ', message);
  })
}

client.on('message', (message) => {
  if(!message.author.bot) {
    checkFor(prefix, message.content, (content) => {
      if(message.member.hasPermission('ADMINISTRATOR')) {
        
        switch(content.split(" ", 2)[0]) {
          case 'watch':
            return addChannel(content, message);
          case 'stopwatching':
            return removeChannel(content, message);
          case 'listwatched':
            return listWatched(content, message);
          case 'setlog':
            return setLog(content, message);
          case 'setprefix':
            return setPrefix(content, message);
          case 'resetprefix':
            return resetPrefix(content, message);
          default:
            return message.channel.send(`Command \`${content}\` unavailable`);
        }

      }
    })
  }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  const channel = newState.channel || oldState.channel;

  console.log('oldState', oldState);
  console.log('newState', newState);

  if(channelsToWatch.includes(channel.id)) {
    if(channel.full) {
      logChannelMessage(`${channel} is full, hiding it`)
      channel.overwritePermissions([
        {
          id: channel.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        }
      ], 'Channel is full');
    } else {
      logChannelMessage(`${channel} is not full, displaying it`)
      channel.overwritePermissions([
        {
          id: channel.guild.roles.everyone,
          allow: ['VIEW_CHANNEL'],
        }
      ], 'Channel is not full');
    }
  }
})

client.login(process.env.CLIENT_SECRET);