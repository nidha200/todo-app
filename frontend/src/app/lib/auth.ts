export function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    return null;
  }
}

export function getRole() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const p = parseJwt(token);
    return p?.role || null;
  } catch (e) {
    return null;
  }
}

export function isAdmin() {
  return getRole() === 'admin';
}

export function getUserId() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const p = parseJwt(token);
    return p?.sub || null;
  } catch (e) {
    return null;
  }
}
