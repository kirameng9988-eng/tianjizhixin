const API_BASE = '/api';

export async function getConfig() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function updateConfig(data: { systemName?: string; logo?: string }) {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getSystems() {
  const res = await fetch(`${API_BASE}/systems`);
  return res.json();
}

export async function addSystem(data: Omit<System, 'id'>) {
  const res = await fetch(`${API_BASE}/systems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateSystem(id: string, data: Partial<System>) {
  const res = await fetch(`${API_BASE}/systems/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteSystem(id: string) {
  const res = await fetch(`${API_BASE}/systems/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export interface System {
  id: string;
  name: string;
  logo: string;
  description: string;
  url: string;
  enabled: boolean;
}
