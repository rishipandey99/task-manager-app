import { api } from './api';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

export async function getUsers() {
  const res = await api.get('/api/users');
  return res.data as PublicUser[];
}

export async function createTeamMember(data: { name: string; email: string; password: string }) {
  const res = await api.post('/api/users/create', data);
  return res.data as PublicUser;
}

export async function deleteTeamMember(id: string) {
  await api.delete(`/api/users/${id}`);
}
