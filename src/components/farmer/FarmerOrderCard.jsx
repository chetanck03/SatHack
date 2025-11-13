import { useReadContract, useAccount } from 'wagmi'
import { useEffect } from 'react'
import { Clock, CheckCircle, XCircle, Package, Truck, MapPin, RefreshCw } from 'lucide-react'
import { ORDER_STATUS, DELIVERY_STATUS } from '../../config/contract'
import { useContract } from '../../hooks/useContract'

const FarmerOrderCard = ({
  orderId,
  activeFilter,
  onAccept,
  onReject,
  onMarkDelivered,
  processingOrderId,
  processingAction,
  isConfirming,
  onStatusUpdate
}) => {
  const { address } = useAccount()
  const { address: contractAddress, abi } = useContract()

  // Get order details
  const { data: order } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'orders',
    args: [orderId],
    enabled: !!contractAddress && !!abi
  })

  // Get produce details
  const { data: produce } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'produces',
    args: [order ? Number(order[0]) : 0], // Use the produceId directly from the raw order array
    enabled: !!order && order.length > 0 && !!contractAddress && !!abi
  })

  // Get produce images
  const { data: produceImages } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getProduceImages',
    args: [order ? Number(order[0]) : 0], // Use the produceId directly from the raw order array
    enabled: !!order && order.length > 0 && !!contractAddress && !!abi
  })

  // Process the raw order data - it comes as an array from the contract
  // Based on the ABI: [produceId, buyer, quantityKg, amountPaid, status, deliveryStatus, deliveryAddress, rejectionMessage]
  const processedOrder = order ? {
    produceId: Number(order[0]),
    buyer: order[1],
    quantityKg: Number(order[2]),
    amountPaid: order[3],
    status: Number(order[4]),
    deliveryStatus: Number(order[5]),
    deliveryAddress: order[6] || '',
    rejectionMessage: order[7] || ''
  } : null

  // Process the raw produce data - it comes as an array from the contract
  // Based on the ABI: [id, name, produceType, originFarm, grade, harvestTime, currentOwner, currentPrice, status, labCertUri, totalQuantityKg, availableQuantityKg]
  const processedProduce = produce ? {
    id: Number(produce[0]),
    name: produce[1] || 'Unknown Product',
    produceType: Number(produce[2]),
    originFarm: produce[3] || 'Unknown Farm',
    grade: produce[4] || 'N/A',
    harvestTime: produce[5],
    currentOwner: produce[6],
    currentPrice: produce[7],
    status: Number(produce[8]),
    labCertUri: produce[9],
    totalQuantityKg: Number(produce[10]),
    availableQuantityKg: Number(produce[11])
  } : null

  // Check if this order belongs to the farmer
  const isOwnerOrder = processedProduce && address && processedProduce.currentOwner.toLowerCase() === address.toLowerCase()

  // Report status to parent component - MUST be called before any early returns
  useEffect(() => {
    if (onStatusUpdate && processedOrder && processedProduce && isOwnerOrder) {
      onStatusUpdate(orderId, processedOrder.status, processedOrder.deliveryStatus, true)

      // Cleanup function to remove from count when component unmounts
      return () => {
        onStatusUpdate(orderId, processedOrder.status, processedOrder.deliveryStatus, false)
      }
    }
  }, [orderId, processedOrder?.status, processedOrder?.deliveryStatus, isOwnerOrder, onStatusUpdate])

  // Early returns after all hooks
  if (!order || !produce || !processedOrder || !processedProduce) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  // Only show orders for this farmer's produce
  if (!isOwnerOrder) {
    return null
  }

  // Filter logic
  const shouldShow = () => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'pending') return processedOrder.status === ORDER_STATUS.PENDING
    if (activeFilter === 'active') return processedOrder.status === ORDER_STATUS.ACCEPTED || processedOrder.deliveryStatus === DELIVERY_STATUS.IN_DELIVERY
    if (activeFilter === 'completed') return processedOrder.status === ORDER_STATUS.COMPLETED && processedOrder.deliveryStatus === DELIVERY_STATUS.DELIVERED
    return true
  }

  if (!shouldShow()) return null

  const formatAddress = (addr) => {
    if (!addr) return 'Unknown'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatPrice = (price) => {
    if (!price || price === 0 || price === '0') return '0.00'

    let priceNumber
    if (typeof price === 'bigint') {
      priceNumber = Number(price.toString())
    } else {
      priceNumber = Number(price)
    }

    const ethValue = priceNumber / 1e18

    if (ethValue < 0.01) {
      return ethValue.toFixed(6)
    } else if (ethValue < 1) {
      return ethValue.toFixed(4)
    } else {
      return ethValue.toFixed(2)
    }
  }

  const getStatusIcon = (status, deliveryStatus) => {
    if (status === ORDER_STATUS.PENDING) {
      return <Clock className="h-5 w-5 text-yellow-600" />
    }
    if (status === ORDER_STATUS.ACCEPTED && deliveryStatus === DELIVERY_STATUS.IN_DELIVERY) {
      return <Truck className="h-5 w-5 text-blue-600" />
    }
    if (status === ORDER_STATUS.COMPLETED && deliveryStatus === DELIVERY_STATUS.DELIVERED) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    if (status === ORDER_STATUS.REJECTED) {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
    if (status === ORDER_STATUS.REFUNDED) {
      return <RefreshCw className="h-5 w-5 text-purple-600" />
    }
    return <Package className="h-5 w-5 text-gray-600" />
  }

  const getStatusColor = (status, deliveryStatus) => {
    if (status === ORDER_STATUS.PENDING) {
      return 'bg-yellow-100 text-yellow-800'
    }
    if (status === ORDER_STATUS.ACCEPTED && deliveryStatus === DELIVERY_STATUS.IN_DELIVERY) {
      return 'bg-blue-100 text-blue-800'
    }
    if (status === ORDER_STATUS.COMPLETED && deliveryStatus === DELIVERY_STATUS.DELIVERED) {
      return 'bg-green-100 text-green-800'
    }
    if (status === ORDER_STATUS.REJECTED) {
      return 'bg-red-100 text-red-800'
    }
    if (status === ORDER_STATUS.REFUNDED) {
      return 'bg-purple-100 text-purple-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status, deliveryStatus) => {
    if (status === ORDER_STATUS.PENDING) return 'Pending'
    if (status === ORDER_STATUS.ACCEPTED && deliveryStatus === DELIVERY_STATUS.IN_DELIVERY) return 'In Delivery'
    if (status === ORDER_STATUS.COMPLETED && deliveryStatus === DELIVERY_STATUS.DELIVERED) return 'Delivered'
    if (status === ORDER_STATUS.REJECTED) return 'Rejected'
    if (status === ORDER_STATUS.REFUNDED) return 'Refunded'
    return 'Unknown'
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex space-x-4 flex-1">
          {/* Product Image */}
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
            {produceImages && produceImages.length > 0 && produceImages[0] ? (
              <img
                src={produceImages[0]}
                alt={processedProduce.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <Package className="h-8 w-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-lg font-semibold text-gray-900">{processedProduce.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(processedOrder.status, processedOrder.deliveryStatus)}`}>
                {getStatusIcon(processedOrder.status, processedOrder.deliveryStatus)}
                <span>{getStatusText(processedOrder.status, processedOrder.deliveryStatus)}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Buyer:</span>
                <div>{formatAddress(processedOrder.buyer)}</div>
              </div>
              <div>
                <span className="font-medium">Quantity:</span>
                <div>{processedOrder.quantityKg} kg</div>
              </div>
              <div>
                <span className="font-medium">Amount:</span>
                <div>{formatPrice(processedOrder.amountPaid)} ETH</div>
              </div>
              <div>
                <span className="font-medium">Order ID:</span>
                <div>#{orderId}</div>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              <div><strong>Farm:</strong> {processedProduce.originFarm}</div>
              <div><strong>Grade:</strong> {processedProduce.grade}</div>
              <div><strong>Price per kg:</strong> {formatPrice(processedProduce.currentPrice)} ETH</div>
            </div>

            {/* Delivery Address - Important for farmers to know where to deliver */}
            {processedOrder.deliveryAddress && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Delivery Address:</p>
                    <p className="text-sm text-blue-800 mt-1">{processedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            )}

            {processedOrder.rejectionMessage && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <span className="font-medium">Rejection reason:</span> {processedOrder.rejectionMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {processedOrder.status === ORDER_STATUS.PENDING && (
            <>
              <button
                onClick={() => onAccept(orderId)}
                disabled={(processingOrderId === orderId && processingAction === 'accept') || isConfirming}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                {(processingOrderId === orderId && processingAction === 'accept') ? 'Processing...' : 'Accept'}
              </button>
              <button
                onClick={() => onReject(orderId)}
                disabled={(processingOrderId === orderId && processingAction === 'reject') || isConfirming}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                {(processingOrderId === orderId && processingAction === 'reject') ? 'Processing...' : 'Reject'}
              </button>
            </>
          )}
          {processedOrder.status === ORDER_STATUS.ACCEPTED && processedOrder.deliveryStatus === DELIVERY_STATUS.IN_DELIVERY && (
            <button
              onClick={() => onMarkDelivered(orderId)}
              disabled={(processingOrderId === orderId && processingAction === 'deliver') || isConfirming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {(processingOrderId === orderId && processingAction === 'deliver') ? 'Processing...' : 'Mark Delivered'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FarmerOrderCard