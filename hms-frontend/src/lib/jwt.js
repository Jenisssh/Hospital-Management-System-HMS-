/** Decode the JWT payload without verifying. Verification happens server-side. */
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Format an error response from our backend ApiError envelope. */
export function extractError(err) {
  const data = err?.response?.data;
  if (data?.fields) {
    return Object.entries(data.fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' • ');
  }
  return data?.message || err?.message || 'Unexpected error';
}
