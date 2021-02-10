const Config = require('../config');
const { addChannel, removeChannel, listWatched } = require('./channels');
const { setPrefix, resetPrefix } = require('./guild_config');
const { getGuildConfigs } = require('../db/guild_config');

class Command {
  constructor(name, params, description) {
    this._name = name;
    this._params = params;
    this._description = description;
  }

  get name() { return this._name }
  get params() { return this._params }
  get description() { return this._description }

  getHelpMessage(prefix) {
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

async function sendHelpMessage(message) {
  const configs = await getGuildConfigs(message.guild);
  const defaultPrefix = Config.getDefaultPrefix();
  const prefix = configs ? configs.prefix || defaultPrefix : defaultPrefix;

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

module.exports = {
  [ADD_CHANNEL.name]: addChannel,
  [REMOVE_CHANNEL.name]: removeChannel,
  [LIST_CHANNELS.name]: listWatched,
  [CHANGE_PREFIX.name]: setPrefix,
  [RESET_PREFIX.name]: resetPrefix,
  [DISPLAY_HELP.name]: sendHelpMessage,
}