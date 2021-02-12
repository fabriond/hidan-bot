import { Message } from 'discord.js';
import { getGuildConfigs } from './db/guild_config';
import { performSimpleOperation } from './db/helpers';
import { checkFor, toggleChannelState } from './helpers';
import { getDefaultPrefix, getDiscordClient } from './config';

const client = getDiscordClient();

import COMMANDS from './commands';

client.on('message', async (message: Message) => {
  if(!message.author.bot) {    
    if(message.member?.hasPermission('ADMINISTRATOR')) {
      try {
        const configs = await getGuildConfigs(message);

        const content = checkFor(getDefaultPrefix(), message.content) || checkFor(configs?.prefix || getDefaultPrefix(), message.content);

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
  return await performSimpleOperation(async (dbClient) => {
    const newChannel = newState.channel;
    const oldChannel = oldState.channel;

    if(newChannel?.id) await toggleChannelState(dbClient, newChannel);
    if(oldChannel?.id && newChannel !== oldChannel) await toggleChannelState(dbClient, oldChannel);
  });
})

client.on('ready', () => {
  client.user?.setActivity(`'${getDefaultPrefix()}'`, {
    type: 'LISTENING'
  })
})

client.login(process.env.CLIENT_SECRET);