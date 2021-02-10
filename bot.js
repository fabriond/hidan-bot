const Config = require('./config');
const client = Config.getDiscordClient();
const mongoClient = Config.getMongoClient;
const { getWatchlist } = require('./db/channels');
const { getConfigs } = require('./db/guild_config');
const { checkFor, logChannelMessage, handleDbError } = require('./helpers');

const COMMANDS = require('./commands');

client.on('message', async (message) => {
  if(!message.author.bot) {    
    if(message.member.hasPermission('ADMINISTRATOR')) {
      try {

        const configs = await getConfigs(message);

        console.log(configs);

        const content = checkFor(Config.getDefaultPrefix(), message.content) || checkFor(configs.prefix, message.content);

        if(content === null) return;

        for(const command in COMMANDS) {
          if(!COMMANDS.hasOwnProperty(command)) continue;

          const params = checkFor(command, content);
          if(params != null){
            return COMMANDS[command].call(null, message, params);
          }
        }

        return message.channel.send(`Command \`${content}\` unavailable`);
      } catch(error) {
        return message.channel.send(error.message);
      }
    }
  }
})

async function switchState(dbClient, channel) {
  const isChannelWatched = !!(await getWatchlist(dbClient, channel.guild.id).findOne({_id: channel.id}));

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
  let dbClient;

  try{
    dbClient = await mongoClient().connect();

    const newChannel = newState.channel;
    const oldChannel = oldState.channel;

    const checkNew = newChannel && newChannel.id
    const checkOld = oldChannel && oldChannel.id

    if(checkNew) await switchState(dbClient, newChannel);
    if(checkOld && newChannel !== oldChannel) await switchState(dbClient, oldChannel);
  } catch(error) {
    handleDbError(error);
  } finally {
    if(dbClient) await dbClient.close();
  }
})

client.on('ready', () => {
  client.user.setActivity(`'${Config.prefix}'`, {
    type: 'LISTENING'
  })
})

client.login(process.env.CLIENT_SECRET);