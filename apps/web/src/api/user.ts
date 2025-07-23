import axios from 'axios'

import { type CurrentUser } from '@/hooks/useCurrentUser'

export function signIn(payload: { name: string; password: string }) {
  return axios.post<{ access_token: string }>('/api/v1/auth/sign-in', payload)
}

export function signUp(payload: { name: string; password: string }) {
  return axios.post<CurrentUser>('/api/v1/auth/sign-up', payload)
}
