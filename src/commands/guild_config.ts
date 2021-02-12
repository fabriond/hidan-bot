import { Message } from 'discord.js';
import { getDefaultPrefix } from '../config';
import { setGuildConfigs } from '../db/guild_config';

async function setPrefix(message: Message, newPrefix: string) {
  if(newPrefix.length < 3) throw Error('Prefix can\'t be under 3 characters long');
  else if(newPrefix.length > 8) throw Error('Prefix can\'t be over 8 characters long');

  setGuildConfigs(message, { prefix: newPrefix });
}

async function resetPrefix(message: Message) {
  setPrefix(message, getDefaultPrefix());
}

export { setPrefix, resetPrefix };