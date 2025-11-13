import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Package, Clock, CheckCircle, XCircle, RefreshCw, ShoppingCart } from 'lucide-react'
import { ORDER_STATUS, DELIVERY_STATUS, ROLES, CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contract'
import { useContract } from '../hooks/useContract'
import OrderCard from '../components/consumer/OrderCard'
import ConsumerOrderCard from '../components/consumer/ConsumerOrderCard'
import FarmerOrderCard from '../components/farmer/FarmerOrderCard'
import { useOrders } from '../hooks/useOrders'
import { useOrderStatusCounts } from '../hooks/useOrderStatusCounts'
import NetworkStatus from '../components/NetworkStatus'
import { toast } from 'sonner'


const Orders = () => {
  const { isConnected, address } = useAccount()
  const { address: contractAddress, abi, isSupported } = useContract()
  const [activeTab, setActiveTab] = useState('all')
  const { orders, loading, error, userRole } = useOrders()
  const { statusCounts, updateOrderCount, resetCounts } = useOrderStatusCounts()

  // Farmer-specific state
  const [farmerOrders, setFarmerOrders] = useState([])
  const [farmerLoading, setFarmerLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectOrderId, setRejectOrderId] = useState(null)
  const [rejectionMessage, setRejectionMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(Date.now())

  // Get order count for farmers
  const { data: orderCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'orderCount',
    enabled: userRole === ROLES.FARMER && isSupported
  })

  // Get farmer's produces
  const { data: farmerProduces } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getProducesByOwner',
    args: [address],
    enabled: !!address && userRole === ROLES.FARMER && isSupported
  })

  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  // Reset processing state when transaction completes
  useEffect(() => {
    if (isSuccess) {
      const actionMessages = {
        'accept': 'Order Accepted Successfully!',
        'reject': 'Order Rejected Successfully!',
        'deliver': 'Order Delivered Successfully!'
      }

      const message = actionMessages[processingAction] || 'Transaction Completed Successfully!'

      setProcessingOrder(null)
      setProcessingAction(null)
      setSuccessMessage(message)
      setShowSuccessModal(true)
    } else if (isError) {
      setProcessingOrder(null)
      setProcessingAction(null)
      toast.error('Transaction failed. Please try again.', {
        duration: 3000
      })
    }
  }, [isSuccess, isError, processingAction])

  // Fetch farmer orders by checking all orders for their produce
  useEffect(() => {
    const fetchFarmerOrders = async () => {
      if (userRole !== ROLES.FARMER || !orderCount || !farmerProduces || !address) {
        setFarmerLoading(false)
        return
      }

      setFarmerLoading(true)
      const orders = []

      try {
        // Get farmer's produce IDs
        const farmerProduceIds = farmerProduces.map(produce => Number(produce.id))

        if (farmerProduceIds.length === 0) {
          setFarmerOrders([])
          setFarmerLoading(false)
          return
        }

        // Check each order to see if it's for farmer's produce
        for (let orderId = 1; orderId <= Number(orderCount); orderId++) {
          orders.push({ id: orderId })
        }

        setFarmerOrders(orders)
      } catch (error) {
        console.error('Error fetching farmer orders:', error)
        setFarmerOrders([])
      } finally {
        setFarmerLoading(false)
      }
    }

    fetchFarmerOrders()
  }, [orderCount, farmerProduces, address, userRole])

  const handleAcceptOrder = async (orderId) => {
    try {
      console.log('=== ACCEPT ORDER DEBUG ===')
      console.log('Order ID:', orderId, 'Type:', typeof orderId)
      console.log('Farmer address:', address)
      console.log('Contract address:', CONTRACT_ADDRESS)

      setProcessingOrder(orderId)
      setProcessingAction('accept')

      // AcceptOrder needs much more gas due to complex operations
      writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'acceptOrder',
        args: [BigInt(orderId)],
        gas: 2000000n // Higher gas for acceptOrder (creates new produce, updates mappings, emits multiple events)
      })

      console.log('Accept order transaction initiated successfully')
    } catch (error) {
      console.error('=== ACCEPT ORDER ERROR ===')
      console.error('Full error object:', error)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error reason:', error.reason)
      console.error('Error data:', error.data)

      setProcessingOrder(null)
      setProcessingAction(null)

      // More specific error handling
      let errorMessage = 'Accept order failed'
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user'
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas'
      } else if (error.message?.includes('execution reverted')) {
        errorMessage = 'Contract execution failed - check order status and ownership'
      } else {
        errorMessage = `Accept failed: ${error.shortMessage || error.message}`
      }

      toast.error(errorMessage, {
        duration: 5000
      })
    }
  }

  const handleRejectOrder = (orderId) => {
    setRejectOrderId(orderId)
    setShowRejectModal(true)
  }

  const confirmRejectOrder = async () => {
    if (!rejectionMessage.trim()) return

    try {
      console.log('Attempting to reject order:', rejectOrderId, 'with message:', rejectionMessage)
      setProcessingOrder(rejectOrderId)
      setProcessingAction('reject')

      writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'rejectOrder',
        args: [BigInt(rejectOrderId), rejectionMessage],
        gas: 300000n // Add explicit gas limit
      })

      console.log('Reject order transaction initiated')
      setShowRejectModal(false)
      setRejectionMessage('')
      setRejectOrderId(null)
    } catch (error) {
      console.error('Error rejecting order:', error)
      console.error('Error details:', error.message)
      setProcessingOrder(null)
      setProcessingAction(null)
      toast.error(`Failed to reject order: ${error.shortMessage || error.message}`, {
        duration: 5000
      })
    }
  }

  const handleMarkDelivered = async (orderId) => {
    try {
      console.log('Attempting to mark delivered:', orderId)
      setProcessingOrder(orderId)
      setProcessingAction('deliver')

      writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'markDelivered',
        args: [BigInt(orderId)],
        gas: 1000000n // Add explicit gas limit
      })

      console.log('Mark delivered transaction initiated')
    } catch (error) {
      console.error('Error marking delivered:', error)
      console.error('Error details:', error.message)
      setProcessingOrder(null)
      setProcessingAction(null)
      toast.error(`Failed to mark delivered: ${error.shortMessage || error.message}`, {
        duration: 5000
      })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return <Clock className="h-5 w-5 text-yellow-600" />
      case ORDER_STATUS.ACCEPTED:
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case ORDER_STATUS.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case ORDER_STATUS.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />
      case ORDER_STATUS.REFUNDED:
        return <RefreshCw className="h-5 w-5 text-purple-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case ORDER_STATUS.ACCEPTED:
        return 'bg-blue-100 text-blue-800'
      case ORDER_STATUS.COMPLETED:
        return 'bg-green-100 text-green-800'
      case ORDER_STATUS.REJECTED:
        return 'bg-red-100 text-red-800'
      case ORDER_STATUS.REFUNDED:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Reset counts when user role changes or component mounts
  useEffect(() => {
    resetCounts()
  }, [userRole, resetCounts])

  const orderCounts = statusCounts
  const isLoading = userRole === ROLES.FARMER ? farmerLoading : loading
  const ordersToShow = userRole === ROLES.FARMER ? farmerOrders : orders

  const tabs = [
    { id: 'all', label: 'All Orders', count: orderCounts.all },
    { id: 'pending', label: 'Pending', count: orderCounts.pending },
    { id: 'active', label: 'Active', count: orderCounts.active },
    { id: 'completed', label: 'Completed', count: orderCounts.completed },
  ]

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your orders</p>
        </div>
      </div>
    )
  }

  if (!userRole || userRole === ROLES.NONE) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Required</h2>
          <p className="text-gray-600">Please register as a farmer or consumer to view orders</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userRole === ROLES.FARMER ? 'Order Management' : 'My Orders'}
          </h1>
          <p className="text-gray-600">
            {userRole === ROLES.FARMER
              ? 'Manage orders for your produce'
              : 'Track your produce orders and deliveries'
            }
          </p>
        </div>

        {/* Network Status */}
        <NetworkStatus />



        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : orderCounts.all}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : orderCounts.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : orderCounts.active}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : orderCounts.completed}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <span>{label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${activeTab === id ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">


            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ordersToShow.length > 0 ? (
              <div className="space-y-4">
                {userRole === ROLES.FARMER ? (
                  // Farmer view with working functionality
                  farmerOrders.map((order) => (
                    <FarmerOrderCard
                      key={`${order.id}-${refreshKey}`}
                      orderId={order.id}
                      activeFilter={activeTab}
                      onAccept={handleAcceptOrder}
                      onReject={handleRejectOrder}
                      onMarkDelivered={handleMarkDelivered}
                      processingOrderId={processingOrder}
                      processingAction={processingAction}
                      isConfirming={isConfirming}
                      onStatusUpdate={updateOrderCount}
                    />
                  ))
                ) : (
                  // Consumer view - filtering is now handled by the counting system
                  // All orders are shown and the individual cards handle their own filtering
                  orders.map(order => (
                    <ConsumerOrderCard 
                      key={order.id} 
                      order={order} 
                      onStatusUpdate={updateOrderCount}
                      activeFilter={activeTab}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {userRole === ROLES.FARMER
                    ? 'Orders for your produce will appear here when customers place orders'
                    : 'Your orders will appear here once you make a purchase from the marketplace'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reject Order Modal */}
        {showRejectModal && (
          <div className="fixed inset-0  bg-opacity-90 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                Reject Order
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this order. This will be visible to the customer.
              </p>
              <textarea
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                rows="4"
                placeholder="Enter rejection reason..."
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectionMessage('')
                    setRejectOrderId(null)
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRejectOrder}
                  disabled={!rejectionMessage.trim() || isConfirming}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {isConfirming ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Reject Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto overflow-x-hidden">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="text-green-600 mb-6">
                  <svg className="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{successMessage}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  The order status has been updated on the blockchain and is now visible to all parties.
                </p>
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    // Force re-mount of all FarmerOrderCard components to fetch fresh data
                    setRefreshKey(Date.now())
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders