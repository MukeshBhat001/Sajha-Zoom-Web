import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.js';

function getMongoDnsServers() {
  return env.MONGODB_DNS_SERVERS
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);
}

function shouldRetryWithDnsFallback(error) {
  return (
    env.MONGO_URI.startsWith('mongodb+srv://') &&
    ['ECONNREFUSED', 'ETIMEOUT', 'ENOTFOUND', 'ESERVFAIL'].includes(error?.code)
  );
}

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.MONGO_URI);
  } catch (error) {
    const dnsServers = getMongoDnsServers();

    if (!shouldRetryWithDnsFallback(error) || dnsServers.length === 0) {
      throw error;
    }

    console.warn('MongoDB SRV lookup failed with the default resolver. Retrying with configured DNS servers.');
    dns.setServers(dnsServers);
    await mongoose.connect(env.MONGO_URI);
  }

  console.log('MongoDB connected');
}
