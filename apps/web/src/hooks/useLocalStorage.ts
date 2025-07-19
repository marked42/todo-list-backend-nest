import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serializer?: (value: T) => string
    deserializer?: (value: string) => T
  }
): [T, (value: T | ((prev: T) => T)) => void] {
  const { serializer = JSON.stringify, deserializer = JSON.parse } =
    options || {}

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? deserializer(item) : initialValue
    } catch (error) {
      console.error('LocalStorage 读取失败', error)
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      localStorage.setItem(key, serializer(valueToStore))
    } catch (error) {
      console.error('LocalStorage 写入失败', error)
    }
  }

  // 跨标签页同步
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(deserializer(e.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, deserializer])

  return [storedValue, setValue]
}
