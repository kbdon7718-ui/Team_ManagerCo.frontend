import { API_BASE_URL } from '../config';

async function requestJson(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Request failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

export async function fetchUsers() {
  const data = await requestJson('/users');
  return data.users;
}

export async function getActiveSession(userId) {
  const data = await requestJson(`/work/active?user_id=${encodeURIComponent(userId)}`, {
    method: 'GET'
  });
  return data;
}

export async function startWork(userId) {
  const data = await requestJson('/work/start', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  });
  return data.session;
}

export async function endWork(userId) {
  const data = await requestJson('/work/end', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  });
  return data.session;
}

export async function fetchDashboardSummary() {
  const data = await requestJson('/dashboard/summary');
  return data.users;
}

export async function fetchAnalyticsSummary() {
  return requestJson('/analytics/summary');
}
