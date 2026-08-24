export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders
  });

  return response;
}
