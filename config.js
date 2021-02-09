const Discord = require('discord.js');
const MongoClient = require('mongodb').MongoClient;
const discordClient = new Discord.Client();
const mongoClient = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const defaultPrefix = 'Hidan,';

class Config {
  static getDefaultPrefix = () => defaultPrefix;
  static getDiscordClient = () => discordClient;
  static getMongoClient = () => mongoClient;
  static prefix = defaultPrefix;
  static logChannelID;
}

module.exports = Config;