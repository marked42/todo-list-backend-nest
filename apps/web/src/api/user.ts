import axios from 'axios'

import { type CurrentUser } from '@/hooks/useCurrentUser'

export function login(payload: { name: string; password: string }) {
  return axios.post<{ access_token: string }>('/api/v1/auth/login', payload)
}

export function register(payload: { name: string; password: string }) {
  return axios.post<CurrentUser>('/api/v1/auth/register', payload)
}
