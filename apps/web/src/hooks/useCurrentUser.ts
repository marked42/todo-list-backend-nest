import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import * as api from '@/api'
import { CURRENT_USER_KEY, type NullableUserContext } from '@/utils/user'
import { axiosInstance } from '@/api/instance'

export function useCurrentUser() {
  // TODO: should use session storage or cookie
  const [user, setUser] = useLocalStorage(
    CURRENT_USER_KEY,
    null as NullableUserContext
  )

  const [loading, setLoading] = useState(false)

  const signIn = async (payload: { email: string; password: string }) => {
    setLoading(true)
    try {
      const user = await api.user.signIn(payload)

      // TODO: refactor this
      axiosInstance.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${user.data.accessToken}`

      setUser({
        email: payload.email,
        accessToken: user.data.accessToken,
        refreshToken: user.data.refreshToken,
      })
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    // setUser(null)
    // revoke user access token in server
    return await api.user.signOut()
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
