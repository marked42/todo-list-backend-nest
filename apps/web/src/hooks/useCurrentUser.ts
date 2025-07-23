import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import * as api from '@/api'

export const CURRENT_USER_KEY = 'todo_current_user'

export interface CurrentUser {
  id: string
  name: string
  accessToken: string
}

type Nullable<T> = T | null | undefined

type NullableUser = Nullable<CurrentUser>

export function useCurrentUser() {
  const [user, setUser] = useLocalStorage(
    CURRENT_USER_KEY,
    null as NullableUser
  )

  const [loading, setLoading] = useState(false)

  const signIn = async (payload: { name: string; password: string }) => {
    setLoading(true)
    try {
      const user = await api.user.signIn(payload)

      setUser({
        // TODO:
        id: '1',
        name: payload.name,
        accessToken: user.data.access_token,
      })
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
  }

  return {
    user,
    get isUserLoggedIn() {
      return !!user
    },
    signIn,
    loading,
    signOut,
  }
}
