const Discord = require('discord.js');
const MongoClient = require('mongodb').MongoClient;
const discordClient = new Discord.Client();
const defaultPrefix = 'Hidan,';

class Config {
  static getDefaultPrefix = () => defaultPrefix;
  static getDiscordClient = () => discordClient;
  static getMongoClient = () => new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  static prefix = defaultPrefix;
  static logChannelID;
}

module.exports = Config;