import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import * as api from '@/api'
import { CURRENT_USER_KEY, type NullableUserContext } from '@/utils/user'

export function useCurrentUser() {
  const [user, setUser] = useLocalStorage(
    CURRENT_USER_KEY,
    null as NullableUserContext
  )

  const [loading, setLoading] = useState(false)

  const signIn = async (payload: { email: string; password: string }) => {
    setLoading(true)
    try {
      const user = await api.user.signIn(payload)

      setUser({
        email: payload.email,
        accessToken: user.data.accessToken,
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
