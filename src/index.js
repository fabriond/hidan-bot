const Config = require('./config');
const client = Config.getDiscordClient();
const { performOperation } = require('./db/helpers');
const { getGuildConfigs } = require('./db/guild_config');
const { checkFor, toggleChannelState } = require('./helpers');

const COMMANDS = require('./commands');

client.on('message', async (message) => {
  if(!message.author.bot) {    
    if(message.member.hasPermission('ADMINISTRATOR')) {
      try {

        const configs = await getGuildConfigs(message.guild);

        const content = checkFor(Config.getDefaultPrefix(), message.content) || checkFor(configs ? configs.prefix : null, message.content);

        if(content === null) return;

        for(const command in COMMANDS) {
          if(!COMMANDS.hasOwnProperty(command)) continue;

          const params = checkFor(command, content);
          if(params != null){
            return await COMMANDS[command].call(null, message, params);
          }
        }

        return message.channel.send(`Command \`${content}\` unavailable`);
      } catch(error) {
        return message.channel.send(error.message);
      }
    }
  }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  return await performOperation(async (dbClient) => {
    const newChannel = newState.channel;
    const oldChannel = oldState.channel;

    const checkNew = newChannel && newChannel.id
    const checkOld = oldChannel && oldChannel.id

    if(checkNew) await toggleChannelState(dbClient, newChannel);
    if(checkOld && newChannel !== oldChannel) await toggleChannelState(dbClient, oldChannel);
  });
})

client.on('ready', () => {
  client.user.setActivity(`'${Config.getDefaultPrefix()}'`, {
    type: 'LISTENING'
  })
})

client.login(process.env.CLIENT_SECRET);