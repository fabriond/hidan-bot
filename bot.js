const Discord = require('discord.js');

const client = new Discord.Client();

let prefix = 'Hidan, ';
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
            watchChannel(content, message);
          case 'setprefix':
            setPrefix(content, message);
          case 'resetprefix':
            resetPrefix(content, message);
          default:
            message.reply(`Command \`${content}\` unavailable`);
        }

      }
    })
  }
})

client.on('voiceStateUpdate', (oldState, newState) => {
  const channel = newState.channel;

  if(channelsToWatch.includes(channel.id)) {
    if(channel.full) {
      channel.overwritePermissions([
        {
          id: channel.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        }
      ], 'Channel is full');
    } else {
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