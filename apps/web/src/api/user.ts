import type { IUserContext } from '@/utils/user'
import { axiosInstance } from './instance'

export function signIn(payload: { email: string; password: string }) {
  return axiosInstance.post<{ accessToken: string; refreshToken: string }>(
    '/api/v1/auth/sign-in',
    payload
  )
}

export function signUp(payload: { email: string; password: string }) {
  return axiosInstance.post<IUserContext>('/api/v1/auth/sign-up', payload)
}

export function signOut() {
  return axiosInstance.post<IUserContext>('/api/v1/auth/sign-out')
}
