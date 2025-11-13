import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Package, XCircle } from 'lucide-react'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract'
import FarmerOrderCard from '../farmer/FarmerOrderCard'

const OrderManagement = () => {
  const { address } = useAccount()
  const [activeFilter, setActiveFilter] = useState('all')
  const [farmerOrders, setFarmerOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState(null)
  const [processingAction, setProcessingAction] = useState(null) // 'accept', 'reject', 'deliver'
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectOrderId, setRejectOrderId] = useState(null)
  const [rejectionMessage, setRejectionMessage] = useState('')
  const [notification, setNotification] = useState(null)

  // Get order count
  const { data: orderCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'orderCount'
  })

  // Get farmer's produces
  const { data: farmerProduces } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProducesByOwner',
    args: [address],
    enabled: !!address
  })

  const { writeContract, data: hash } = useWriteContract()

  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  // Reset processing state when transaction completes
  useEffect(() => {
    if (isSuccess) {
      setProcessingOrder(null)
      setProcessingAction(null)
      setNotification({ type: 'success', message: 'Transaction completed successfully!' })
      setTimeout(() => setNotification(null), 3000)
    } else if (isError) {
      setProcessingOrder(null)
      setProcessingAction(null)
      setNotification({ type: 'error', message: 'Transaction failed. Please try again.' })
      setTimeout(() => setNotification(null), 3000)
    }
  }, [isSuccess, isError])

  // Fetch farmer orders by checking all orders for their produce
  useEffect(() => {
    const fetchFarmerOrders = async () => {
      if (!orderCount || !farmerProduces || !address) {
        setLoading(false)
        return
      }

      setLoading(true)
      const orders = []

      try {
        // Get farmer's produce IDs
        const farmerProduceIds = farmerProduces.map(produce => Number(produce.id))

        if (farmerProduceIds.length === 0) {
          setFarmerOrders([])
          setLoading(false)
          return
        }

        // Check each order to see if it's for farmer's produce
        for (let orderId = 1; orderId <= Number(orderCount); orderId++) {
          // We'll add the order ID and let OrderCard component fetch the details
          // This is more efficient than fetching all order details here
          orders.push({ id: orderId })
        }

        setFarmerOrders(orders)
      } catch (error) {
        console.error('Error fetching farmer orders:', error)
        setFarmerOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchFarmerOrders()
  }, [orderCount, farmerProduces, address])

  const handleAcceptOrder = async (orderId) => {
    try {
      setProcessingOrder(orderId)
      setProcessingAction('accept')
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'acceptOrder',
        args: [orderId]
      })
    } catch (error) {
      console.error('Error accepting order:', error)
      setProcessingOrder(null)
      setProcessingAction(null)
    }
  }

  const handleRejectOrder = (orderId) => {
    setRejectOrderId(orderId)
    setShowRejectModal(true)
  }

  const confirmRejectOrder = async () => {
    if (!rejectionMessage.trim()) return

    try {
      setProcessingOrder(rejectOrderId)
      setProcessingAction('reject')
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'rejectOrder',
        args: [rejectOrderId, rejectionMessage]
      })
      setShowRejectModal(false)
      setRejectionMessage('')
      setRejectOrderId(null)
    } catch (error) {
      console.error('Error rejecting order:', error)
      setProcessingOrder(null)
      setProcessingAction(null)
    }
  }

  const handleMarkDelivered = async (orderId) => {
    try {
      setProcessingOrder(orderId)
      setProcessingAction('deliver')
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'markDelivered',
        args: [orderId]
      })
    } catch (error) {
      console.error('Error marking delivered:', error)
      setProcessingOrder(null)
      setProcessingAction(null)
    }
  }



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
        <div className="flex space-x-2">
          {['all', 'pending', 'delivered', 'rejected'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeFilter === filter
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {farmerOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h4>
          <p className="text-gray-600 mb-4">
            Orders for your produce will appear here when customers make purchases.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              Make sure your produce is listed in the marketplace to start receiving orders!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {farmerOrders.map((order) => (
            <FarmerOrderCard
              key={order.id}
              orderId={order.id}
              activeFilter={activeFilter}
              onAccept={handleAcceptOrder}
              onReject={handleRejectOrder}
              onMarkDelivered={handleMarkDelivered}
              processingOrderId={processingOrder}
              processingAction={processingAction}
              isConfirming={isConfirming}
            />
          ))}
        </div>
      )}

      {/* Reject Order Modal */}
      {showRejectModal && (
        <div className="fixed inset-0  bg-opacity-30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
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
    </div>
  )
}

export default OrderManagement