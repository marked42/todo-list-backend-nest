export const CURRENT_USER_KEY = 'todo_current_user'

export interface IUserContext {
  email: string
  accessToken: string
}

export type Nullable<T> = T | null | undefined

export type NullableUserContext = Nullable<IUserContext>

export function getUserFromLocalStorage() {
  const item = window.localStorage.getItem(CURRENT_USER_KEY)
  if (!item) return null

  try {
    const user = JSON.parse(item)
    return user as IUserContext
  } catch (e) {
    return null
  }
}

export function getUserTokenFromLocalStorage() {
  const user = getUserFromLocalStorage()
  return user ? user.accessToken : ''
}
