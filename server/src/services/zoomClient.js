import { env, hasZoomConfig } from '../config/env.js';

const ZOOM_TOKEN_URL = 'https://zoom.us/oauth/token';
const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

let cachedToken = {
  accessToken: '',
  expiresAt: 0
};

class ZoomApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ZoomApiError';
    this.status = status;
    this.details = details;
  }
}

async function readResponseBody(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function getZoomAccessToken() {
  if (!hasZoomConfig()) {
    throw new ZoomApiError('Zoom credentials are not configured.', 500);
  }

  const now = Date.now();
  if (cachedToken.accessToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.accessToken;
  }

  const credentials = Buffer.from(`${env.ZOOM_CLIENT_ID}:${env.ZOOM_CLIENT_SECRET}`).toString('base64');
  const params = new URLSearchParams({
    grant_type: 'account_credentials',
    account_id: env.ZOOM_ACCOUNT_ID
  });

  const response = await fetch(`${ZOOM_TOKEN_URL}?${params.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`
    }
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new ZoomApiError('Unable to get Zoom access token.', response.status, body);
  }

  cachedToken = {
    accessToken: body.access_token,
    expiresAt: now + Number(body.expires_in ?? 3600) * 1000
  };

  return cachedToken.accessToken;
}

export async function zoomApiRequest(path, params = {}) {
  const accessToken = await getZoomAccessToken();
  const url = new URL(`${ZOOM_API_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new ZoomApiError(`Zoom API request failed: ${path}`, response.status, body);
  }

  return body;
}

export async function listUserRecordings({ userId, from, to, nextPageToken }) {
  return zoomApiRequest(`/users/${encodeURIComponent(userId)}/recordings`, {
    from,
    to,
    page_size: env.ZOOM_SYNC_PAGE_SIZE,
    next_page_token: nextPageToken,
    include_fields: 'download_access_token'
  });
}

export async function fetchZoomFile(downloadUrl, { range } = {}) {
  const accessToken = await getZoomAccessToken();
  const headers = {
    Authorization: `Bearer ${accessToken}`
  };

  if (range) {
    headers.Range = range;
  }

  return fetch(downloadUrl, {
    headers,
    redirect: 'follow'
  });
}
