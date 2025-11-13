import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ABI, ROLES } from '../config/contract'
import { useContract } from './useContract'

export const useOrders = () => {
    const { address, isConnected } = useAccount()
    const { address: contractAddress, abi, isSupported } = useContract()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Get user role
    const { data: userRole } = useReadContract({
        address: contractAddress,
        abi: abi,
        functionName: 'userRoles',
        args: [address],
        enabled: isConnected && !!address && isSupported
    })

    // Get orders for consumers
    const { data: consumerOrders, isLoading: isLoadingConsumerOrders } = useReadContract({
        address: contractAddress,
        abi: abi,
        functionName: 'getOrdersByBuyer',
        args: [address],
        enabled: isConnected && !!address && userRole === ROLES.CONSUMER && isSupported
    })

    // Note: myOrders is a mapping, we can't directly get all order IDs
    // We'll work with the orders returned by getOrdersByBuyer

    // For farmers, we need to get all orders and filter by their produce
    const { data: orderCount } = useReadContract({
        address: contractAddress,
        abi: abi,
        functionName: 'orderCount',
        enabled: isConnected && userRole === ROLES.FARMER && isSupported
    })

    const { data: farmerProduces } = useReadContract({
        address: contractAddress,
        abi: abi,
        functionName: 'getProducesByOwner',
        args: [address],
        enabled: isConnected && !!address && userRole === ROLES.FARMER && isSupported
    })

    // Get total order count to find real order IDs
    const { data: totalOrderCount } = useReadContract({
        address: contractAddress,
        abi: abi,
        functionName: 'orderCount',
        enabled: isConnected && userRole === ROLES.CONSUMER && isSupported
    })

    useEffect(() => {
        if (!isConnected || !address || !userRole || userRole === ROLES.NONE) {
            setOrders([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            if (userRole === ROLES.CONSUMER) {
                if (totalOrderCount && Number(totalOrderCount) > 0) {
                    // For consumers, create order objects for all orders and let ConsumerOrderCard filter them
                    const processedOrders = []
                    
                    // Check each order ID - ConsumerOrderCard will filter by buyer address
                    for (let orderId = 1; orderId <= Number(totalOrderCount); orderId++) {
                        processedOrders.push({
                            id: orderId, // Real order ID from blockchain
                            realOrderData: null // Will be fetched by ConsumerOrderCard
                        })
                    }
                    
                    setOrders(processedOrders)
                } else {
                    setOrders([])
                }
            } else if (userRole === ROLES.FARMER && orderCount) {
                // For farmers, show all orders and let filtering happen in the component
                const farmerOrders = []
                for (let orderId = 1; orderId <= Number(orderCount); orderId++) {
                    farmerOrders.push({ id: orderId })
                }
                setOrders(farmerOrders)
            } else {
                setOrders([])
            }
        } catch (err) {
            console.error('Error processing orders:', err)
            setError(err.message)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }, [
        isConnected,
        address,
        userRole,
        totalOrderCount,
        orderCount,
        isLoadingConsumerOrders
    ])

    return {
        orders,
        loading: loading || isLoadingConsumerOrders,
        error,
        userRole,
        refetch: () => {
            // Trigger a refetch by updating a dependency
            setLoading(true)
        }
    }
}