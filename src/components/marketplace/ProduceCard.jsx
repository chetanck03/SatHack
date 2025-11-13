import { useReadContract } from 'wagmi'
import { MapPin, Star, Package, Calendar } from 'lucide-react'
import { CONTRACT_ABI, PRODUCE_TYPE_LABELS } from '../../config/contract'
import { useContract } from '../../hooks/useContract'

const ProduceCard = ({ produceId, onClick }) => {
  const { address: contractAddress } = useContract()

  // Get produce details
  const { data: produce, isLoading: isLoadingProduce, error: produceError } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'produces',
    args: [produceId],
    enabled: !!produceId
  })

  // Get produce images
  const { data: images, error: imagesError } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getProduceImages',
    args: [produceId],
    enabled: !!produceId
  })

  // Debug logging
  console.log(`ProduceCard for the Marketplace ${produceId}:`, {
    produce,
    produceError,
    images,
    imagesError,
    isLoadingProduce,
    produceName: produce?.name,
    produceId: produce?.id
  })

  // Show loading state
  if (isLoadingProduce) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (produceError) {
    console.error(`Error loading produce ${produceId}:`, produceError)
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden p-4">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading produce #{produceId}</p>
          <p className="text-xs mt-1">{produceError.message}</p>
        </div>
      </div>
    )
  }

  // Don't render if no produce data
  if (!produce) {
    console.log(`No produce data for ID ${produceId}`)
    return null
  }

  // Debug logging for ProduceCard
  if (produce) {
    console.log('🔍 ProduceCard Raw Data:', {
      produce,
      isArray: Array.isArray(produce),
      length: produce.length,
      totalQuantityKg: produce[12],
      availableQuantityKg: produce[13]
    })
  }

  // Parse the array data based on actual console output structure
  const produceData = {
    id: produce[0],                    // uint256: id
    name: produce[1],                  // string: name  
    produceType: produce[2],           // uint8: produceType
    originFarm: produce[3],            // string: originFarm
    grade: produce[4],                 // string: grade
    harvestTime: produce[5],           // uint256: harvestTime
    currentOwner: produce[6],          // address: currentOwner
    currentPrice: produce[7],          // uint256: currentPrice
    status: produce[8],                // uint8: status
    labCertUri: produce[9],            // string: labCertUri
    totalQuantityKg: produce[10] || 0,      // uint256: totalQuantityKg (index 10)
    availableQuantityKg: produce[11] || 0   // uint256: availableQuantityKg (index 11)
  }

  console.log('📊 ProduceCard Parsed Data:', {
    totalQuantityKg: produceData.totalQuantityKg,
    availableQuantityKg: produceData.availableQuantityKg
  })

  // More lenient check - only filter out completely empty produces
  if (produceData.id === '0' || produceData.id === 0) {
    console.log(`Filtering out empty produce with ID ${produceData.id}`)
    return null
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

  // Get default image based on produce type
  const getDefaultImage = (produceType) => {
    const defaultImages = {
      0: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=300&h=200&fit=crop', // Vegetable
      1: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&h=200&fit=crop', // Fruit
      2: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop', // Grain
      3: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop', // Dairy
      4: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=200&fit=crop', // Meat
      5: 'https://images.unsplash.com/photo-1462536943532-57a629f6cc60?w=300&h=200&fit=crop', // Herb
      6: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=200&fit=crop', // Spice
      7: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=200&fit=crop', // Nut
      8: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop', // Seed
      9: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop'  // Other
    }
    return defaultImages[produceType] || defaultImages[9] // Default to "Other" if type not found
  }

  const mainImage = images && images.length > 0
    ? images[0]
    : getDefaultImage(produceData.produceType)

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={produceData.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = getDefaultImage(produceData.produceType)
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(produceData.grade)}`}>
            Grade {produceData.grade || 'N/A'}
          </span>
        </div>

        {/* Default Image Tag */}
        {(!images || images.length === 0) && (
          <div className="absolute top-2 left-2 bg-green-600 bg-opacity-90 text-white px-2 py-1 rounded text-xs font-medium">
            📷 Default Image
          </div>
        )}

        {images && images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            +{images.length - 1} more
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
          {produceData.name || 'Unnamed Produce'}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {PRODUCE_TYPE_LABELS[produceData.produceType] || 'Other'}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{produceData.originFarm || 'Unknown Farm'}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Harvested {formatDate(produceData.harvestTime)}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Package className="h-4 w-4 mr-1" />
            <span>{formatQuantity(produceData.availableQuantityKg)} kg available</span>
          </div>

        </div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-green-600">
            {formatPrice(produceData.currentPrice)} ETH/kg
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProduceCard