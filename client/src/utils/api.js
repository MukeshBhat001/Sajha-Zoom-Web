const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.trim() ?? '';
const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, '');
const apiPrefix = '/api';

function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

export const endpoints = {
  recordings(queryString = '') {
    const suffix = queryString ? `?${queryString}` : '';
    return `${apiPrefix}/recordings${suffix}`;
  },
  recordingCategories: `${apiPrefix}/recordings/categories`,
  syncZoom: `${apiPrefix}/sync/zoom`,
  recordingStream(recordingId) {
    return `${apiPrefix}/recordings/${recordingId}/stream`;
  },
  recordingThumbnail(recordingId) {
    return `${apiPrefix}/recordings/${recordingId}/thumbnail`;
  }
};

export async function apiRequest(path, options = {}) {
  const { headers, ...requestOptions } = options;

  const response = await fetch(apiUrl(path), {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === 'object' && body?.message ? body.message : 'Request failed';
    throw new Error(message);
  }

  return body;
}

export function recordingStreamUrl(recordingId) {
  return apiUrl(endpoints.recordingStream(recordingId));
}

export function recordingThumbnailUrl(recordingId) {
  return apiUrl(endpoints.recordingThumbnail(recordingId));
}
