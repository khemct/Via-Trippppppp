const BASE_URL = '/api';

async function request(method, path, body = null, token = null, signal = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(typeof data === 'string' ? data : data.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const auth = {
  register: (body) => request('POST', '/auth/register', body),

  login: (body) => request('POST', '/auth/login', body),

  logout: (token) => request('POST', '/auth/logout', null, token),

  me: (token) => request('GET', '/auth/me', null, token),

  forgotPassword: (body) => request('POST', '/auth/forgot-password', body),

  resetPassword: (body) => request('POST', '/auth/reset-password', body),
};

export const trips = {
  create: (body, token) => request('POST', '/trips', body, token),

  list: (params, token) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', '/trips' + qs, null, token);
  },

  get: (id, token) => request('GET', `/trips/${id}`, null, token),

  update: (id, body, token) => request('PATCH', `/trips/${id}`, body, token),

  delete: (id, token) => request('DELETE', `/trips/${id}`, null, token),
};

export const places = {
  autocomplete: (q, signal) => request('GET', `/places/autocomplete?q=${encodeURIComponent(q)}`, null, null, signal),
};

export const itinerary = {
  seed: (tripId, token) => request('POST', `/trips/${tripId}/recommendations/seed`, null, token),
  reseed: (tripId, token) => request('POST', `/trips/${tripId}/recommendations/reseed`, null, token),
  listRecommendations: (tripId, params, token) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `/trips/${tripId}/recommendations${qs}`, null, token);
  },
  listWaypoints: (tripId, token) => request('GET', `/trips/${tripId}/waypoints`, null, token),
  addWaypoint: (tripId, body, token) => request('POST', `/trips/${tripId}/waypoints`, body, token),
  updateWaypoint: (tripId, waypointId, body, token, signal) => request('PATCH', `/trips/${tripId}/waypoints/${waypointId}`, body, token, signal),
  deleteWaypoint: (tripId, waypointId, token) => request('DELETE', `/trips/${tripId}/waypoints/${waypointId}`, null, token),
  reorderWaypoints: (tripId, body, token) => request('PUT', `/trips/${tripId}/waypoints/reorder`, body, token),
  getFeasibility: (tripId, token) => request('GET', `/trips/${tripId}/feasibility`, null, token),
};
