import { useState } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Calendar, User } from 'lucide-react'
import { CONTRACT_ABI, ORDER_STATUS, DELIVERY_STATUS, ROLES } from '../../config/contract'
import { useContract } from '../../hooks/useContract'

const OrderCard = ({ orderId, userRole }) => {
  const { address } = useAccount()
  const { address: contractAddress, abi, isSupported } = useContract()
  const [rejectionMessage, setRejectionMessage] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Get order details
  const { data: order } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'orders',
    args: [orderId],
    enabled: isSupported
  })

  // Get produce details
  const { data: produce } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'produces',
    args: [order?.produceId],
    enabled: !!order?.produceId && isSupported
  })

  const { writeContract, data: hash } = useWriteContract()
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  })

  if (!order || !produce) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  // Filter orders based on user role
  if (userRole === ROLES.CONSUMER && order.buyer.toLowerCase() !== address?.toLowerCase()) {
    return null // Don't show orders that don't belong to this consumer
  }

  if (userRole === ROLES.FARMER && produce.currentOwner.toLowerCase() !== address?.toLowerCase()) {
    return null // Don't show orders that don't belong to this farmer's produce
  }

  const formatPrice = (price) => {
    return `$${(Number(price) / 1e18).toFixed(2)}`
  }

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getStatusInfo = (orderStatus, deliveryStatus) => {
    if (orderStatus === ORDER_STATUS.PENDING) {
      return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    }
    if (orderStatus === ORDER_STATUS.ACCEPTED && deliveryStatus === DELIVERY_STATUS.IN_DELIVERY) {
      return { label: 'In Delivery', color: 'bg-blue-100 text-blue-800', icon: Truck }
    }
    if (orderStatus === ORDER_STATUS.COMPLETED) {
      return { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    }
    if (orderStatus === ORDER_STATUS.REJECTED) {
      return { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    if (orderStatus === ORDER_STATUS.REFUNDED) {
      return { label: 'Refunded', color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
    }
    return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: Package }
  }

  const handleAcceptOrder = async () => {
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'acceptOrder',
        args: [orderId]
      })
    } catch (error) {
      console.error('Error accepting order:', error)
    }
  }

  const handleRejectOrder = async () => {
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'rejectOrder',
        args: [orderId, rejectionMessage]
      })
      setShowRejectModal(false)
      setRejectionMessage('')
    } catch (error) {
      console.error('Error rejecting order:', error)
    }
  }

  const handleMarkDelivered = async () => {
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'markDelivered',
        args: [orderId]
      })
    } catch (error) {
      console.error('Error marking delivered:', error)
    }
  }

  const handleClaimRefund = async () => {
    try {
      await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'claimRefund',
        args: [orderId]
      })
    } catch (error) {
      console.error('Error claiming refund:', error)
    }
  }

  const statusInfo = getStatusInfo(order.status, order.deliveryStatus)
  const StatusIcon = statusInfo.icon

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Order Info */}
          <div className="flex space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{produce.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  <StatusIcon className="inline h-3 w-3 mr-1" />
                  {statusInfo.label}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{produce.originFarm}</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  <span>{Number(order.quantityKg)} kg</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>
                    {userRole === ROLES.FARMER ? 'Buyer' : 'Seller'}: {formatAddress(
                      userRole === ROLES.FARMER ? order.buyer : produce.currentOwner
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex flex-col lg:items-end space-y-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(order.amountPaid)}
              </div>
              <div className="text-sm text-gray-600">
                Order #{orderId}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {/* Farmer Actions */}
              {userRole === ROLES.FARMER && order.status === ORDER_STATUS.PENDING && (
                <>
                  <button
                    onClick={handleAcceptOrder}
                    disabled={isConfirming}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isConfirming}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}

              {userRole === ROLES.FARMER && 
               order.status === ORDER_STATUS.ACCEPTED && 
               order.deliveryStatus === DELIVERY_STATUS.IN_DELIVERY && (
                <button
                  onClick={handleMarkDelivered}
                  disabled={isConfirming}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Mark Delivered
                </button>
              )}

              {/* Consumer Actions */}
              {userRole === ROLES.CONSUMER && order.status === ORDER_STATUS.REJECTED && (
                <button
                  onClick={handleClaimRefund}
                  disabled={isConfirming}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Claim Refund
                </button>
              )}

              {/* Track Order Button */}
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Track Order
              </button>
            </div>
          </div>
        </div>

        {/* Rejection Message */}
        {order.status === ORDER_STATUS.REJECTED && order.rejectionMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Rejection Reason:</strong> {order.rejectionMessage}
            </p>
          </div>
        )}
      </div>

      {/* Reject Order Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Order</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this order:
            </p>
            <textarea
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="3"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOrder}
                disabled={!rejectionMessage.trim() || isConfirming}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OrderCard