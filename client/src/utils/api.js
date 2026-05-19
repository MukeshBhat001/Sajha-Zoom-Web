export async function apiRequest(path, options = {}) {
  const { headers, ...requestOptions } = options;

  const response = await fetch(path, {
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
  return `/api/recordings/${recordingId}/stream`;
}

export function recordingThumbnailUrl(recordingId) {
  return `/api/recordings/${recordingId}/thumbnail`;
}
