const KEY = 'hb_token';

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t) => localStorage.setItem(KEY, t);
export const removeToken = () => localStorage.removeItem(KEY);
export const isLoggedIn = () => !!getToken();

// Attach token to every fetch automatically
export function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
    },
  });
}

export function getRole() {
  const token = getToken();
  if (!token) return null;
  try {
    // decode payload (no verification needed client-side, server verifies)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}
export function isAdmin() {
  return getRole() === 'admin';
}