const BASE_URL = '/api';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
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
