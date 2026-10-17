const API_BASE = '/api';

async function request(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${url}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// Candidate APIs
export const candidateApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/candidates${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/candidates/${id}`),
  create: (data) => request('/candidates', { method: 'POST', body: data }),
  update: (id, data) => request(`/candidates/${id}`, { method: 'PUT', body: data }),
  updateStage: (id, stage) => request(`/candidates/${id}/stage`, { method: 'PATCH', body: { stage } }),
  delete: (id) => request(`/candidates/${id}`, { method: 'DELETE' })
};

// Job APIs
export const jobApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/jobs${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/jobs/${id}`),
  create: (data) => request('/jobs', { method: 'POST', body: data }),
  update: (id, data) => request(`/jobs/${id}`, { method: 'PUT', body: data }),
  updateStatus: (id, status) => request(`/jobs/${id}/status`, { method: 'PATCH', body: { status } }),
  delete: (id) => request(`/jobs/${id}`, { method: 'DELETE' })
};

// Dashboard APIs
export const dashboardApi = {
  getMetrics: () => request('/dashboard/metrics'),
  getPipeline: () => request('/dashboard/pipeline'),
  getApplicationsOverTime: () => request('/dashboard/applications-over-time'),
  getSources: () => request('/dashboard/sources'),
  getActivity: () => request('/dashboard/activity')
};

// Search API
export const searchApi = {
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`)
};
