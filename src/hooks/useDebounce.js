import { useState, useEffect } from 'react'

/**
 * Custom hook để debounce giá trị
 * Giúp giảm số lần re-render và tính toán khi người dùng nhập liệu
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}




