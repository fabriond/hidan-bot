import { Client as DiscordClient } from 'discord.js';
import { MongoClient } from 'mongodb';

const defaultPrefix = 'Hidan,';
const discordClient = new DiscordClient();
const mongoURI = process.env.MONGO_URI || '';

const getDefaultPrefix = () => defaultPrefix;
const getDiscordClient = () => discordClient;
const newMongoClient = () => new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

export { getDefaultPrefix, getDiscordClient, newMongoClient }