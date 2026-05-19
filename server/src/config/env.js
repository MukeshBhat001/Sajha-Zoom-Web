import dotenv from 'dotenv';

dotenv.config();

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInteger(process.env.PORT, 5000),
  MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/zoom_recorded_classes',
  MONGODB_DNS_SERVERS: process.env.MONGODB_DNS_SERVERS ?? '8.8.8.8,1.1.1.1',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  ZOOM_ACCOUNT_ID: process.env.ZOOM_ACCOUNT_ID ?? '',
  ZOOM_CLIENT_ID: process.env.ZOOM_CLIENT_ID ?? '',
  ZOOM_CLIENT_SECRET: process.env.ZOOM_CLIENT_SECRET ?? '',
  ZOOM_USER_ID: process.env.ZOOM_USER_ID ?? 'me',
  ZOOM_USER_IDS: process.env.ZOOM_USER_IDS ?? '',
  ZOOM_SYNC_LOOKBACK_DAYS: clamp(parseInteger(process.env.ZOOM_SYNC_LOOKBACK_DAYS, 30), 1, 365),
  ZOOM_SYNC_PAGE_SIZE: clamp(parseInteger(process.env.ZOOM_SYNC_PAGE_SIZE, 100), 1, 300),
  SYNC_INTERVAL_MINUTES: clamp(parseInteger(process.env.SYNC_INTERVAL_MINUTES, 15), 0, 1440),
  SYNC_ON_START: parseBoolean(process.env.SYNC_ON_START, true),
  ENABLE_PUBLIC_SYNC_ENDPOINT: parseBoolean(process.env.ENABLE_PUBLIC_SYNC_ENDPOINT, true),
  DEFAULT_CATEGORY: process.env.DEFAULT_CATEGORY ?? 'General',
  CATEGORY_RULES: process.env.CATEGORY_RULES ?? ''
};

export function hasZoomConfig() {
  return Boolean(env.ZOOM_ACCOUNT_ID && env.ZOOM_CLIENT_ID && env.ZOOM_CLIENT_SECRET && getZoomUserIds().length > 0);
}

export function getZoomUserIds() {
  const configuredUsers = env.ZOOM_USER_IDS || env.ZOOM_USER_ID;

  return configuredUsers
    .split(',')
    .map((userId) => userId.trim())
    .filter(Boolean);
}
