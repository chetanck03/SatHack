import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, User } from 'lucide-react'
import { ORDER_STATUS, DELIVERY_STATUS } from '../../config/contract'
import { useContract } from '../../hooks/useContract'

const ConsumerOrderCard = ({ order, onStatusUpdate, activeFilter }) => {
    const { address } = useAccount()
    const { address: contractAddress, abi, isSupported } = useContract()

    // Get order details from blockchain using the real order ID
    const { data: orderData } = useReadContract({
        address: contractAddress,
        abi: abi,
        functionName: 'orders',
        args: [order.id],
        enabled: isSupported
    })

    // Process the raw order data
    // Based on the ABI: [produceId, buyer, quantityKg, amountPaid, status, deliveryStatus, deliveryAddress, rejectionMessage]
    const processedOrder = orderData ? {
        produceId: Number(orderData[0]),
        buyer: orderData[1],
        quantityKg: Number(orderData[2]),
        amountPaid: orderData[3],
        status: Number(orderData[4]),
        deliveryStatus: Number(orderData[5]),
        deliveryAddress: orderData[6] || '',
        rejectionMessage: orderData[7] || ''
    } : null

    // Get produce details using the order's produceId
    const { data: produce } = useReadContract({
        address: contractAddress,
        abi: abi,
        functionName: 'produces',
        args: [processedOrder?.produceId || 0],
        enabled: !!processedOrder?.produceId && isSupported
    })

    // Get produce images
    const { data: produceImages } = useReadContract({
        address: contractAddress,
        abi: abi,
        functionName: 'getProduceImages',
        args: [processedOrder?.produceId || 0],
        enabled: !!processedOrder?.produceId && isSupported
    })

    const { writeContract, data: hash } = useWriteContract()

    const { isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash,
    })

    // Process the raw produce data - it comes as an array from the contract
    // Based on the ABI: [id, name, produceType, originFarm, grade, harvestTime, currentOwner, currentPrice, status, labCertUri, totalQuantityKg, availableQuantityKg]
    const processedProduce = produce ? {
        id: Number(produce[0]),                    // id
        name: produce[1] || 'Unknown Product',     // name
        produceType: Number(produce[2]),           // produceType
        originFarm: produce[3] || 'Unknown Farm',  // originFarm
        grade: produce[4] || 'N/A',                // grade
        harvestTime: produce[5],                   // harvestTime
        currentOwner: produce[6],                  // currentOwner
        currentPrice: produce[7],                  // currentPrice
        status: Number(produce[8]),                // status (enum)
        labCertUri: produce[9],                    // labCertUri
        totalQuantityKg: Number(produce[10]),      // totalQuantityKg
        availableQuantityKg: Number(produce[11])   // availableQuantityKg
    } : null

    // Check if this order belongs to the consumer
    const isOwnerOrder = processedOrder && address && processedOrder.buyer.toLowerCase() === address.toLowerCase()
    
    // Report status to parent component - MUST be called before any early returns
    useEffect(() => {
        if (onStatusUpdate && processedOrder && isOwnerOrder) {
            onStatusUpdate(order.id, processedOrder.status, processedOrder.deliveryStatus, true)
            
            // Cleanup function to remove from count when component unmounts
            return () => {
                onStatusUpdate(order.id, processedOrder.status, processedOrder.deliveryStatus, false)
            }
        }
    }, [order.id, processedOrder?.status, processedOrder?.deliveryStatus, isOwnerOrder, onStatusUpdate])

    // Early returns after all hooks
    if (!isOwnerOrder) {
        return null
    }

    if (!produce || !processedProduce) {
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

    // Use the processed order data
    const actualOrder = processedOrder

    // Filter logic based on activeFilter
    const shouldShow = () => {
        if (!activeFilter || activeFilter === 'all') return true
        if (activeFilter === 'pending') return actualOrder.status === ORDER_STATUS.PENDING
        if (activeFilter === 'active') return actualOrder.status === ORDER_STATUS.ACCEPTED || actualOrder.deliveryStatus === DELIVERY_STATUS.IN_DELIVERY
        if (activeFilter === 'completed') return actualOrder.status === ORDER_STATUS.COMPLETED && actualOrder.deliveryStatus === DELIVERY_STATUS.DELIVERED
        return true
    }

    if (!shouldShow()) return null

    const formatPrice = (price) => {
        if (!price || price === 0 || price === '0') return '0.00'

        let priceNumber
        if (typeof price === 'bigint') {
            // Convert BigInt to string first, then to number to avoid precision loss
            priceNumber = Number(price.toString())
        } else {
            priceNumber = Number(price)
        }

        const ethValue = priceNumber / 1e18

        // Show more decimal places for small amounts
        if (ethValue < 0.01) {
            return ethValue.toFixed(6)
        } else if (ethValue < 1) {
            return ethValue.toFixed(4)
        } else {
            return ethValue.toFixed(2)
        }
    }

    const formatAddress = (addr) => {
        if (!addr) return 'Unknown'
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

    const handleClaimRefund = async () => {
        try {
            writeContract({
                address: contractAddress,
                abi: abi,
                functionName: 'claimRefund',
                args: [order.id] // Now using the real order ID from blockchain
            })
        } catch (error) {
            console.error('Error claiming refund:', error)
        }
    }

    const statusInfo = getStatusInfo(actualOrder.status, actualOrder.deliveryStatus)
    const StatusIcon = statusInfo.icon

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Order Info */}
                <div className="flex space-x-4">
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
                        {/* Fallback icon that shows if image fails to load */}
                        {produceImages && produceImages.length > 0 && produceImages[0] && (
                            <Package className="h-8 w-8 text-gray-400 absolute inset-0 m-auto hidden" style={{ display: 'none' }} />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{processedProduce.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                <StatusIcon className="inline h-3 w-3 mr-1" />
                                {statusInfo.label}
                            </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{processedProduce.produceType === 9 ? 'Owner:' : 'Farm:'} {processedProduce.originFarm}</span>
                            </div>
                            <div className="flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                <span>Order: {Number(actualOrder.quantityKg) || 0} {processedProduce.produceType === 9 ? 'units' : 'kg'}</span>
                            </div>
                            <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                <span>Seller: {formatAddress(processedProduce.currentOwner)}</span>
                            </div>
                            <div className="flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                <span>{processedProduce.produceType === 9 ? 'Condition:' : 'Grade:'} {processedProduce.grade}</span>
                            </div>
                            <div className="flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                <span>Price{processedProduce.produceType === 9 ? ':' : ' per kg:'} {formatPrice(processedProduce.currentPrice)} ETH</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col lg:items-end space-y-3">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                            {formatPrice(actualOrder.amountPaid)} ETH
                        </div>
                        <div className="text-sm text-gray-600">
                            Order #{order.id}
                        </div>
                        <div className="text-xs text-gray-500">
                            {processedProduce.produceType === 9 ? 'Listed:' : 'Harvest:'} {processedProduce.harvestTime ? new Date(Number(processedProduce.harvestTime) * 1000).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        {/* Consumer Actions */}
                        {actualOrder.status === ORDER_STATUS.REJECTED && (
                            <button
                                onClick={handleClaimRefund}
                                disabled={isConfirming}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Claim Refund
                            </button>
                        )}

                       
                    </div>
                </div>
            </div>

            {/* Delivery Address - Show consumer their delivery address */}
            {actualOrder.deliveryAddress && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-green-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-green-900 mb-1">Delivery Address</h4>
                            <p className="text-sm text-green-800 leading-relaxed">{actualOrder.deliveryAddress}</p>
                            <p className="text-xs text-green-600 mt-1">Your order will be delivered to this address</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Message */}
            {actualOrder.status === ORDER_STATUS.REJECTED && actualOrder.rejectionMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {actualOrder.rejectionMessage}
                    </p>
                </div>
            )}

            {/* Additional Order Information */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-600">Total Quantity:</span>
                        <div className="text-gray-900">{processedProduce.totalQuantityKg} {processedProduce.produceType === 9 ? 'units' : 'kg'}</div>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Available:</span>
                        <div className="text-gray-900">{processedProduce.availableQuantityKg} {processedProduce.produceType === 9 ? 'units' : 'kg'}</div>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <div className="text-gray-900">{processedProduce.status === 0 ? (processedProduce.produceType === 9 ? 'Available' : 'Harvested') : 'Sold'}</div>
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">{processedProduce.produceType === 9 ? 'Documentation:' : 'Lab Cert:'}</span>
                        <div className="text-gray-900">
                            {processedProduce.labCertUri ? (
                                <a href={processedProduce.labCertUri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {processedProduce.produceType === 9 ? 'View Documentation' : 'View Certificate'}
                                </a>
                            ) : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConsumerOrderCard