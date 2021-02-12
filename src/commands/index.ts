import { Message } from 'discord.js';
import { getDefaultPrefix } from '../config';
import { getGuildConfigs } from '../db/guild_config';
import { setPrefix, resetPrefix } from './guild_config';
import { addChannel, removeChannel, listWatched } from './channels';

class Command {
  readonly name: string;
  readonly params: string;
  readonly description: string;

  constructor(name: string, params: string, description: string) {
    this.name = name;
    this.params = params;
    this.description = description;
  }

  getHelpMessage(prefix: string) {
    const commandParts = [prefix];
    if(this.name) commandParts.push(this.name);
    if(this.params) commandParts.push(this.params);

    return `\`${commandParts.join(' ')}\` - ${this.description}`;
  }
}

const ADD_CHANNEL = new Command('watch', '<channel_id>', "adds voice channel to the watch list, making them private as soon as they're full and visible otherwise");
const REMOVE_CHANNEL = new Command('stop watching', '<channel_id>', "removes voice channel from the watch list");
const LIST_CHANNELS = new Command('list watched', '', "lists all watched channels");
const CHANGE_PREFIX = new Command('set prefix', '<new_prefix>', "changes the server prefix (the default prefix always works regardless of the server prefix)");
const RESET_PREFIX = new Command('reset prefix', '', "removes server prefix, so that only the default prefix is recognized");
const DISPLAY_HELP = new Command('help', '', "displays the list of commands");

async function sendHelpMessage(message: Message) {
  const configs = await getGuildConfigs(message);
  const defaultPrefix = getDefaultPrefix();
  const prefix = configs?.prefix || defaultPrefix;

  message.channel.send(
    `List of commands: \n`
    + `${ADD_CHANNEL.getHelpMessage(prefix)}\n`
    + `${REMOVE_CHANNEL.getHelpMessage(prefix)}\n`
    + `${LIST_CHANNELS.getHelpMessage(prefix)}\n`
    + `${CHANGE_PREFIX.getHelpMessage(prefix)}\n`
    + `${RESET_PREFIX.getHelpMessage(prefix)}\n`
    + `${DISPLAY_HELP.getHelpMessage(prefix)}`
  )
}

export default {
  [ADD_CHANNEL.name]: addChannel,
  [REMOVE_CHANNEL.name]: removeChannel,
  [LIST_CHANNELS.name]: listWatched,
  [CHANGE_PREFIX.name]: setPrefix,
  [RESET_PREFIX.name]: resetPrefix,
  [DISPLAY_HELP.name]: sendHelpMessage,
}