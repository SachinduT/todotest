const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

async function request(path = '', options = {}) {
  const response = await fetch(`${API_BASE_URL}/todos${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data;
}

export const todoApi = {
  getAll: () => request(),
  create: (title) =>
    request('', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
  update: (id, changes) =>
    request(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
  remove: (id) => request(`/${id}`, { method: 'DELETE' }),
  clearCompleted: () => request('/completed/all', { method: 'DELETE' }),
};
