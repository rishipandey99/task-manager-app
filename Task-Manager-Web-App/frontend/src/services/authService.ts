import { api } from './api';

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await api.post('/api/auth/register', data);
  return res.data as { token: string; user: { id: string; name: string; email: string } };
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await api.post('/api/auth/login', data);
  return res.data as { token: string; user: { id: string; name: string; email: string } };
}

