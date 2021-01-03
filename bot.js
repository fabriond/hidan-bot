const Discord = require('discord.js');

const client = new Discord.Client();

let prefix = 'Hidan, ';
let logChannel;
const channelsToWatch = [];

function checkFor(text, messageContent, callback, trim = true) {
  if(messageContent.startsWith(text)) {
    let result = messageContent.replace(text, '')
    if(trim) result = result.trim();
    callback(result);
  }
}

function watchChannel(content, message) {
  checkFor('watch', content, async (channelID) => {
    try {
      const channel = await client.channels.fetch(channelID);
      if(channel.isText()) throw Error('Text channels not allowed');

      channelsToWatch.push(channel.id);
      message.reply(`Added channel ${channel.toString()} to the watch list`);
    } catch(error) {
      message.reply(error.message);
    }
  })
}

function setLog(content, message) {
  checkFor('setlog', content, async (channelID) => {
    try {
      const channel = await client.channels.fetch(channelID);
      if(!channel.isText()) throw Error('Voice channels not allowed');

      logChannel = channel.id;
      message.reply(`Set channel ${channel.toString()} as the log channel`);
    } catch(error) {
      message.reply(error.message);
    }
  })
}

function setPrefix(content, message) {
  checkFor('setprefix ', content, async (newPrefix) => {
    try {
      if(newPrefix.length > 8) throw Error('Prefix can\'t be over 8 characters');

      prefix = newPrefix;
      message.reply(`Set prefix to: \`${newPrefix}\``)
    } catch(error) {
      message.reply(error.message);
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
            return watchChannel(content, message);
          case 'setlog':
            return setLog(content, message);
          case 'setprefix':
            return setPrefix(content, message);
          case 'resetprefix':
            return resetPrefix(content, message);
          default:
            return message.reply(`Command \`${content}\` unavailable`);
        }

      }
    })
  }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  const channel = newState.channel;
  let textChannel;
  try {
    textChannel = await client.channels.fetch(logChannel);
  } catch(error) {
    message.reply(error.message)
  }
  if(textChannel) textChannel.send(`${oldState}, ${newState}`)
  console.log(oldState, newState)
  if(channelsToWatch.includes(channel.id)) {
    if(channel.full) {
      if(textChannel) textChannel.send(`${channel} is full, hiding it`)
      channel.overwritePermissions([
        {
          id: channel.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        }
      ], 'Channel is full');
    } else {
      if(textChannel) textChannel.send(`${channel} is not full, displaying it`)
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