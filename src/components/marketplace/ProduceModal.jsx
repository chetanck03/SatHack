import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Package, ExternalLink, ShoppingCart } from 'lucide-react'
import { CONTRACT_ABI, ROLES } from '../../config/contract'
import { useContract } from '../../hooks/useContract'

const ProduceModal = ({ produceId, produceData, onClose }) => {
  const { address } = useAccount()
  const { address: contractAddress, abi, isSupported } = useContract()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [isOrdering, setIsOrdering] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Save current body overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow

    // Disable body scroll
    document.body.style.overflow = 'hidden'

    // Cleanup function to restore original overflow
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  // Get produce details - use passed data if available, otherwise fetch from contract
  const { data: contractProduce, isLoading: isLoadingProduce, error: produceError } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'produces',
    args: [produceId],
    enabled: !!produceId && !produceData
  })

  // Use passed data or fetched data
  const rawProduce = produceData || contractProduce

  // Debug logging to see exact structure
  if (rawProduce) {
    console.log('🔍 ProduceModal Raw Data Debug:', {
      rawProduce,
      isArray: Array.isArray(rawProduce),
      length: rawProduce.length,
      indices: rawProduce.map((item, index) => ({ index, value: item, type: typeof item }))
    })
  }

  // Parse the array data based on actual console output structure
  const produce = rawProduce ? {
    id: rawProduce[0] || 0,                    // uint256: id
    name: rawProduce[1] || 'Unknown',          // string: name
    produceType: rawProduce[2] || 0,           // uint8: produceType
    originFarm: rawProduce[3] || 'Unknown Farm', // string: originFarm
    grade: rawProduce[4] || 'N/A',             // string: grade
    harvestTime: rawProduce[5] || 0,           // uint256: harvestTime
    currentOwner: rawProduce[6] || '0x0',      // address: currentOwner
    currentPrice: rawProduce[7] || 0,          // uint256: currentPrice
    status: rawProduce[8] || 0,                // uint8: status
    labCertUri: rawProduce[9] || '',           // string: labCertUri
    totalQuantityKg: rawProduce[10] || 0,      // uint256: totalQuantityKg (index 10)
    availableQuantityKg: rawProduce[11] || 0   // uint256: availableQuantityKg (index 11)
  } : null

  // Additional debug logging for quantity fields
  if (produce) {
    console.log('📊 ProduceModal Parsed Data:', {
      totalQuantityKg: produce.totalQuantityKg,
      availableQuantityKg: produce.availableQuantityKg,
      rawIndex10: rawProduce?.[10], // totalQuantityKg
      rawIndex11: rawProduce?.[11], // availableQuantityKg
      rawLength: rawProduce?.length
    })
  }

  // Get produce images
  const { data: images, error: imagesError } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getProduceImages',
    args: [produceId],
    enabled: !!produceId && isSupported
  })

  // Get user role (only when wallet is connected)
  const { data: userRole } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'userRoles',
    args: [address],
    enabled: !!address && isSupported // Only check role when wallet is connected
  })

  // Get total price for quantity
  const { data: totalPrice } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getProducePrice',
    args: [produceId, quantity],
    enabled: quantity > 0 && quantity <= Number(produce?.availableQuantityKg || 0)
  })

  const { writeContract, data: hash } = useWriteContract()

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  })

  if (!produce || (!produceData && isLoadingProduce)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading produce details...</p>
        </div>
      </div>
    )
  }

  // Debug: Log the produce data to see what we're getting
  console.log('Produce data in marketplace modal:', produce)
  console.log('Produce ID:', produceId)
  console.log('Images data:', images)
  console.log('Produce error:', produceError)
  console.log('Images error:', imagesError)

  // Additional safety check for produce data
  if (produce && (produce.id === '0' || produce.id === 0)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Produce Not Found</h3>
          <p className="text-gray-600 mb-6">The requested produce could not be found or may have been removed.</p>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const formatPrice = (price) => {
    if (!price || price === '0') return '0.00'
    try {
      const priceNum = Number(price)
      if (isNaN(priceNum)) return '0.00'
      return `${(priceNum / 1e18).toFixed(3)}`
    } catch (error) {
      console.error('Error formatting price:', error, price)
      return '0.00'
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'Not set'
    try {
      const timestampNum = Number(timestamp)
      if (isNaN(timestampNum) || timestampNum === 0) return 'Not set'

      const date = new Date(timestampNum * 1000)
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }

      return date.toLocaleDateString('en-US', options)
    } catch (error) {
      console.error('Error formatting date:', error, timestamp)
      return 'Invalid date'
    }
  }

  const formatQuantity = (quantity) => {
    if (!quantity) return '0'
    try {
      const quantityNum = Number(quantity)
      if (isNaN(quantityNum)) return '0'
      return quantityNum.toString()
    } catch (error) {
      console.error('Error formatting quantity:', error, quantity)
      return '0'
    }
  }

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-blue-100 text-blue-800',
      'B+': 'bg-yellow-100 text-yellow-800',
      'B': 'bg-orange-100 text-orange-800',
      'C': 'bg-red-100 text-red-800'
    }
    return colors[grade] || 'bg-gray-100 text-gray-800'
  }

  const handlePlaceOrder = async () => {
    if (!totalPrice || userRole !== ROLES.CONSUMER || !deliveryAddress.trim()) return

    try {
      setIsOrdering(true)
      await writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'placeOrder',
        args: [produceId, quantity, deliveryAddress.trim()],
        value: totalPrice
      })
    } catch (error) {
      console.error('Error placing order:', error)
    } finally {
      setIsOrdering(false)
    }
  }

  const nextImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  // Get default image based on produce type
  const getDefaultImage = (produceType) => {
    const defaultImages = {
      0: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&h=400&fit=crop', // Vegetable
      1: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&h=400&fit=crop', // Fruit
      2: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop', // Grain
      3: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=400&fit=crop', // Dairy
      4: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop', // Meat
      5: 'https://images.unsplash.com/photo-1462536943532-57a629f6cc60?w=600&h=400&fit=crop', // Herb
      6: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop', // Spice
      7: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&h=400&fit=crop', // Nut
      8: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', // Seed
      9: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop'  // Other
    }
    return defaultImages[produceType] || defaultImages[9] // Default to "Other" if type not found
  }

  const currentImage = images && images.length > 0 
    ? images[currentImageIndex] 
    : getDefaultImage(produce?.produceType)
  const maxQuantity = Number(produce.availableQuantityKg)
  const canOrder = userRole === ROLES.CONSUMER && maxQuantity > 0 && quantity > 0 && quantity <= maxQuantity && deliveryAddress.trim().length > 0

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto overflow-x-hidden">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{produce.name || 'Unnamed Produce'}</h1>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Carousel */}
            <div className="space-y-4">
              <div className="relative bg-white rounded-xl shadow-sm overflow-hidden">
                <img
                  src={currentImage}
                  alt={produce.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.src = getDefaultImage(produce?.produceType)
                  }}
                />
                
                {/* Default Image Tag */}
                {(!images || images.length === 0) && (
                  <div className="absolute top-4 left-4 bg-green-600 bg-opacity-90 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                    📷 Default Image - No photos uploaded yet
                  </div>
                )}
                
                {images && images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {images && images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${index === currentImageIndex ? 'border-green-500' : 'border-gray-200'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${produce.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/64/64'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Basic Info */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(produce.grade)}`}>
                      Grade {produce.grade || 'Not specified'}
                    </span>
                  </div>

                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>Origin: {produce.originFarm || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Harvested: {formatDate(produce.harvestTime)}</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      <span>Available: {formatQuantity(produce.availableQuantityKg)} kg</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {formatPrice(produce.currentPrice)} ETH/kg
                  </div>
                  <div className="text-gray-600">
                    Total quantity: {formatQuantity(produce.totalQuantityKg)} kg
                  </div>
                </div>

                {/* Lab Certificate */}
                {produce.labCertUri && (
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Quality Certification</h4>
                    <a
                      href={produce.labCertUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      View Lab Certificate
                    </a>
                  </div>
                )}

                {/* Order Section */}
                {!address ? (
                  // Show connect wallet message when no wallet is connected - AgriChain theme
                  <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
                    <div className="text-center">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Ready to Purchase?</h4>
                      <p className="text-gray-600 mb-4">
                        Connect your wallet to place an order for this fresh produce
                      </p>
                      <div className="bg-white rounded-lg p-4 mb-4 border border-green-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Price per kg:</span>
                          <span className="font-semibold text-green-600">{formatPrice(produce?.currentPrice || 0)} ETH</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-semibold text-gray-900">{Number(produce?.availableQuantityKg || 0)} kg</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        🌱 Fresh from {produce?.originFarm || 'verified farms'}
                      </p>
                    </div>
                  </div>
                ) : userRole === ROLES.CONSUMER && maxQuantity > 0 ? (
                  // Show order form for connected consumers
                  <div className="bg-white border-2 border-green-200 p-6 rounded-xl">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Place Order</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity (kg)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={maxQuantity}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Address *
                        </label>
                        <textarea
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Enter your complete delivery address..."
                          required
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {totalPrice && (
                        <div className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Price:</span>
                            <span className="text-xl font-bold text-green-600">
                              {formatPrice(totalPrice)}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handlePlaceOrder}
                        disabled={!canOrder || isOrdering || isConfirming}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>
                          {isOrdering || isConfirming ? 'Processing...' : 'Place Order'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : address && userRole !== ROLES.CONSUMER ? (
                  // Show registration message for connected wallets that aren't consumers
                  <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                    <p className="text-yellow-800 font-medium">
                      Only registered consumers can place orders. Please register as a consumer to purchase produce.
                    </p>
                  </div>
                ) : (
                  // Fallback for other cases
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <p className="text-gray-600 text-center">
                      Product information loaded. Connect wallet to purchase.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProduceModal