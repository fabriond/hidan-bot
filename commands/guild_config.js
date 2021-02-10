const Config = require('../config');
const { setGuildConfigs } = require('../db/guild_config');

async function setPrefix(message, newPrefix) {
  if(newPrefix.length < 3) throw Error('Prefix can\'t be under 3 characters long');
  else if(newPrefix.length > 8) throw Error('Prefix can\'t be over 8 characters long');

  setGuildConfigs(message, { prefix: newPrefix });
}

async function resetPrefix(message) {
  setPrefix(message, Config.getDefaultPrefix());
}

module.exports = { setPrefix, resetPrefix };