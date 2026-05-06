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

// Tool types
export type SystemType = 'internal' | 'external';

// Area types
export type SystemArea = 'government' | 'internet';

// Tool categories
export const SYSTEM_CATEGORIES = [
  { value: 'integration', label: '数据集成' },
  { value: 'service', label: '数据服务' },
  { value: 'agent', label: '智能体' },
  { value: 'other', label: '其他' },
] as const;

export interface System {
  id: string;
  name: string;
  type: SystemType;
  sort: number;
  area: SystemArea;
  category: string;
  urlGov: string;
  urlInternet: string;
  description: string;
  enabled: boolean;
  logo?: string;
}

// User Management
export interface User {
  id: string;
  username: string;
  roleId: string;
}

export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

export async function addUser(data: { username: string; password: string; roleId: string }) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateUser(id: string, data: Partial<User>) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

// Role Management
export interface Role {
  id: string;
  name: string;
  systemIds: string[];
}

export async function getRoles() {
  const res = await fetch(`${API_BASE}/roles`);
  return res.json();
}

export async function addRole(data: Omit<Role, 'id'>) {
  const res = await fetch(`${API_BASE}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateRole(id: string, data: Partial<Role>) {
  const res = await fetch(`${API_BASE}/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteRole(id: string) {
  const res = await fetch(`${API_BASE}/roles/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

// Get systems accessible by user's role
export async function getAccessibleSystems(roleId: string): Promise<System[]> {
  const [systems, roles] = await Promise.all([getSystems(), getRoles()]);
  const role = roles.find((r: Role) => r.id === roleId);
  if (!role) return [];
  return systems.filter((s: System) => role.systemIds.includes(s.id));
}

// Application Management
export interface Application {
  id: string;
  systemId: string;
  userId: string;
  username: string;
  systemName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  applyTime: string;
  processTime?: string;
  processNote?: string;
}

export async function getApplications(userId?: string, role?: string) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (role) params.append('role', role);
  const res = await fetch(`${API_BASE}/applications?${params}`);
  return res.json();
}

export async function getPendingApplications() {
  const res = await fetch(`${API_BASE}/applications/pending`);
  return res.json();
}

export async function createApplication(data: {
  systemId: string;
  userId: string;
  username: string;
  systemName: string;
  reason: string;
}) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateApplication(id: string, data: {
  status: 'approved' | 'rejected' | 'completed';
  processNote?: string;
}) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}