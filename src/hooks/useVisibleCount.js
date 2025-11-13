import { useState, useCallback } from 'react'

export const useVisibleCount = () => {
  const [visibleCount, setVisibleCount] = useState(0)
  const [visibleItems, setVisibleItems] = useState(new Set())

  const registerVisible = useCallback((id) => {
    setVisibleItems(prev => {
      const newSet = new Set(prev)
      newSet.add(id)
      setVisibleCount(newSet.size)
      return newSet
    })
  }, [])

  const registerHidden = useCallback((id) => {
    setVisibleItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      setVisibleCount(newSet.size)
      return newSet
    })
  }, [])

  const reset = useCallback(() => {
    setVisibleItems(new Set())
    setVisibleCount(0)
  }, [])

  return { visibleCount, registerVisible, registerHidden, reset }
}