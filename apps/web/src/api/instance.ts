import axios from 'axios'
import { getUserTokenFromLocalStorage } from '@/utils/user'

export const axiosInstance = axios.create({
  headers: {
    Authorization: `Bearer ${getUserTokenFromLocalStorage()}`,
  },
})
