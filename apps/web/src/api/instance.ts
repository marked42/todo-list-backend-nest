import axios, { type AxiosResponse } from 'axios'
import {
  getUserFromLocalStorage,
  getUserTokenFromLocalStorage,
  setUserToLocalStorage,
} from '@/utils/user'

export const axiosInstance = axios.create({
  headers: {
    common: {
      Authorization: `Bearer ${getUserTokenFromLocalStorage()}`,
    },
  },
})

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response)
    return response
  },
  async (err) => {
    console.log('err:', err)
    if (err.response?.status === 401) {
      const redirectToSignIn = () => {
        window.location.href = '/sign-in'
      }
      const user = getUserFromLocalStorage()
      const currentRefreshToken = user?.refreshToken
      if (!currentRefreshToken) {
        redirectToSignIn()
        return
      }

      try {
        // Attempt to refresh tokens
        const { data: tokens } = await refreshTokens(currentRefreshToken)
        setUserToLocalStorage({
          ...user,
          ...tokens,
        })

        err.config.headers['Authorization'] = `Bearer ${tokens.accessToken}`
        // replayRequest(err.config, tokens.accessToken)
        return axiosInstance(err.config)
      } catch (e) {
        redirectToSignIn()
      }
    } else {
      throw err
    }
  }
)

let refreshRequest: Promise<
  AxiosResponse<{ accessToken: string; refreshToken: string }, any>
> | null = null
export function refreshTokens(token: string) {
  if (refreshRequest) {
    return refreshRequest
  }

  refreshRequest = axiosInstance.post<{
    accessToken: string
    refreshToken: string
  }>(
    '/api/v1/auth/refresh-tokens',
    {
      token,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  refreshRequest!
    .then((data) => {
      refreshRequest = null
      return data
    })
    .catch((err) => {
      refreshRequest = null
      throw err
    })

  return refreshRequest
}
