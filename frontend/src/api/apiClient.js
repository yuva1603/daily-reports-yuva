const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders
    });
    return response;
  } catch (err) {
    console.error(`[API Error] Request to ${url} failed:`, err);
    throw err;
  }
}

