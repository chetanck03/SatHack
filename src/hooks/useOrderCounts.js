import { useState, useEffect, useCallback } from 'react'
import { useReadContract } from 'wagmi'
import { ORDER_STATUS, DELIVERY_STATUS, ROLES } from '../config/contract'
import { useContract } from './useContract'

export const useOrderCounts = (userRole, address, refreshKey = 0) => {
  const { address: contractAddress, abi, isSupported } = useContract()
  const [counts, setCounts] = useState({ all: 0, pending: 0, active: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [userOrders, setUserOrders] = useState([])

  // Get total order count
  const { data: orderCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'orderCount',
    enabled: isSupported
  })

  // Get farmer's produces
  const { data: farmerProduces } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getProducesByOwner',
    args: [address],
    enabled: !!address && userRole === ROLES.FARMER && isSupported
  })

  const fetchOrderData = useCallback(async (orderId) => {
    if (!contractAddress || !abi) return null
    
    try {
      // This would need to be implemented with a direct contract call
      // For now, we'll return null and let the components handle the filtering
      return null
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error)
      return null
    }
  }, [contractAddress, abi])

  useEffect(() => {
    const calculateCounts = async () => {
      if (!orderCount || !address || !userRole || userRole === ROLES.NONE) {
        setCounts({ all: 0, pending: 0, active: 0, completed: 0 })
        setUserOrders([])
        setLoading(false)
        return
      }

      setLoading(true)
      const newCounts = { all: 0, pending: 0, active: 0, completed: 0 }
      const orders = []

      try {
        // For now, we'll create order IDs and let the individual components
        // handle the filtering and counting. This is more efficient than
        // fetching all order data here.
        for (let orderId = 1; orderId <= Number(orderCount); orderId++) {
          orders.push({ id: orderId })
          newCounts.all++
        }

        setUserOrders(orders)
        setCounts(newCounts)
      } catch (error) {
        console.error('Error calculating order counts:', error)
        setCounts({ all: 0, pending: 0, active: 0, completed: 0 })
        setUserOrders([])
      } finally {
        setLoading(false)
      }
    }

    calculateCounts()
  }, [orderCount, address, userRole, farmerProduces, contractAddress, abi, isSupported, refreshKey])

  return { counts, loading, userOrders }
}