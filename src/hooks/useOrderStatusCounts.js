import { useState, useCallback } from 'react'
import { ORDER_STATUS, DELIVERY_STATUS } from '../config/contract'

export const useOrderStatusCounts = () => {
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    active: 0,
    completed: 0
  })

  const updateOrderCount = useCallback((orderId, status, deliveryStatus, isVisible) => {
    setStatusCounts(prev => {
      const newCounts = { ...prev }

      if (isVisible) {
        // Add to counts
        newCounts.all++

        if (status === ORDER_STATUS.PENDING) {
          newCounts.pending++
        } else if (status === ORDER_STATUS.ACCEPTED || deliveryStatus === DELIVERY_STATUS.IN_DELIVERY) {
          newCounts.active++
        } else if (status === ORDER_STATUS.COMPLETED && deliveryStatus === DELIVERY_STATUS.DELIVERED) {
          // Only count as completed if both status is COMPLETED AND delivery status is DELIVERED
          newCounts.completed++
        }
        // Note: REJECTED and REFUNDED orders are counted in "all" but not in specific categories
      } else {
        // Remove from counts (when component unmounts or becomes invisible)
        newCounts.all = Math.max(0, newCounts.all - 1)

        if (status === ORDER_STATUS.PENDING) {
          newCounts.pending = Math.max(0, newCounts.pending - 1)
        } else if (status === ORDER_STATUS.ACCEPTED || deliveryStatus === DELIVERY_STATUS.IN_DELIVERY) {
          newCounts.active = Math.max(0, newCounts.active - 1)
        } else if (status === ORDER_STATUS.COMPLETED && deliveryStatus === DELIVERY_STATUS.DELIVERED) {
          // Only count as completed if both status is COMPLETED AND delivery status is DELIVERED
          newCounts.completed = Math.max(0, newCounts.completed - 1)
        }
        // Note: REJECTED and REFUNDED orders are counted in "all" but not in specific categories
      }

      return newCounts
    })
  }, [])

  const resetCounts = useCallback(() => {
    setStatusCounts({
      all: 0,
      pending: 0,
      active: 0,
      completed: 0
    })
  }, [])

  return {
    statusCounts,
    updateOrderCount,
    resetCounts
  }
}