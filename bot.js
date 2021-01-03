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
      const channel = await message.guild.channels.resolve(channelID);
      if(!channel) throw Error('Channel not found');
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
  checkFor('stop watching', content, async (channelID) => {
    try {
      const channel = await message.guild.channels.resolve(channelID);
      if(!channel) throw Error('Channel not found');
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
  checkFor('list watched', content, async () => {
    try {
      if(channelsToWatch.length === 0) throw Error('No channels are currently being watched');

      const channels = await Promise.all(
        channelsToWatch.map((channelID) => {
          return message.guild.channels.resolve(channelID);
        })
      );

      message.channel.send(`Channels being watched: ${channels.filter((channel) => !!channel).join(", ")}`)
    } catch(error) {
      message.channel.send(error.message);
    }
  })
}

function setLog(content, message) {
  checkFor('set log channel', content, async (channelID) => {
    try {
      const channel = await message.guild.channels.resolve(channelID);
      if(!channel.isText()) throw Error('Voice channels not allowed');

      logChannel = channel.id;
      message.channel.send(`Set channel ${channel.toString()} as the log channel`);
    } catch(error) {
      message.channel.send(error.message);
    }
  })
}

function setPrefix(content, message) {
  checkFor('set prefix ', content, async (newPrefix) => {
    try {
      if(newPrefix.length < 3) throw Error('Prefix can\'t be under 3 characters long');
      else if(newPrefix.length > 8) throw Error('Prefix can\'t be over 8 characters long');

      prefix = newPrefix;
      message.channel.send(`Set prefix to: \`${newPrefix}\``)
    } catch(error) {
      message.channel.send(error.message);
    }
  }, false)
}

function resetPrefix(content, message) {
  checkFor('reset prefix', content, async () => {
    setPrefix('setprefix Hidan, ', message);
  })
}

function helpMessage() {
  return `List of commands: \n
\`watch <channel_id>\` - adds voice channel to the watch list, making them private as soon as they're full and visible otherwise\n
\`stop watching <channel_id>\` - removes voice channel from the watch list\n
\`list watched\` - lists all watched channels\n
`
}

client.on('message', (message) => {
  if(!message.author.bot) {
    checkFor(prefix, message.content, (content) => {
      if(message.member.hasPermission('ADMINISTRATOR')) {
        
        switch(true) {
          case content.startsWith('watch'):
            return addChannel(content, message);

          case content.startsWith('stop watching'):
            return removeChannel(content, message);

          case content.startsWith('list watched'):
            return listWatched(content, message);

          case content.startsWith('set log channel'):
            return setLog(content, message);

          case content.startsWith('set prefix'):
            return setPrefix(content, message);

          case content.startsWith('reset prefix'):
            return resetPrefix(content, message);

          case content.startsWith('help'):
            return message.channel.send(helpMessage());

          default:
            return message.channel.send(`Command \`${content}\` unavailable`);
        }

      }
    })
  }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  const channel = newState.channel || oldState.channel;

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

client.on('ready', () => {
  client.user.setActivity(`\`${prefix}\``, {
    type: 'LISTENING'
  })
})

client.login(process.env.CLIENT_SECRET);