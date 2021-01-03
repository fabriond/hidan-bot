const Discord = require('discord.js');

const client = new Discord.Client();
const MongoClient = require('mongodb').MongoClient;

let prefix = 'Hidan, ';
let logChannelID;
const dbClient = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

function handleDbError(error, replyChannel) {
  if(replyChannel) replyChannel.send(error.message);
  else console.log(error.message);

  throw error;
}

function getWatchlist(guildID) {
  return dbClient.db().collection(`watchlist-${guildID}`);
}

async function getWatchedIDs(guildID) {
  return (await getWatchlist(guildID).find().toArray()).map((c) => c._id)
}

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

      await dbClient.connect(async (error) => {
        if(error) handleDbError(error, message.channel);
        
        try{
          await getWatchlist(message.guild.id).insertOne({
            _id: channel.id
          })
          
          message.channel.send(`Added channel ${channel.toString()} to the watch list`);
        } catch(error) {
          handleDbError(error, message.channel)
        }
      });      
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

      await dbClient.connect(async (error) => {
        if(error) handleDbError(error, message.channel);
        
        try {
          await getWatchlist(message.guild.id).deleteOne({
            _id: channel.id
          })
           
          message.channel.send(`Removed channel ${channel.toString()} from the watch list`);
        } catch(error) {
          handleDbError(error, message.channel);
        }
      }); 
    } catch(error) {
      message.channel.send(error.message);
    }
  })
}

function listWatched(content, message) {
  checkFor('list watched', content, async () => {
    try {
      await dbClient.connect(async (error) => {
        if(error) handleDbError(error);
        
        const channelsToWatch = await getWatchedIDs(message.guild.id);
        console.log(channelsToWatch);

        if(channelsToWatch.length === 0) throw Error('No channels are currently being watched');
    
        const channels = await Promise.all(
          channelsToWatch.map((channelID) => {
            return message.guild.channels.resolve(channelID);
          })
        );
  
        message.channel.send(`Channels being watched: ${channels.filter((channel) => !!channel).join(", ")}`)
      });
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

async function switchState(channel) {
  const isChannelWatched = !!(await getWatchlist(channel.guild.id).findOne({_id: channel.id}));

  if(isChannelWatched) {
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
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  await dbClient.connect(async (error) => {
    if(error) handleDbError(error);
    
    const newChannel = newState.channel;
    const oldChannel = oldState.channel;

    const checkNew = newChannel && newChannel.id
    const checkOld = oldChannel && oldChannel.id

    if(checkNew) switchState(newChannel);
    if(checkOld && newChannel !== oldChannel) switchState(oldChannel);
  });
})

client.on('ready', () => {
  client.user.setActivity(`\`${prefix}\``, {
    type: 'LISTENING'
  })
})

client.login(process.env.CLIENT_SECRET);