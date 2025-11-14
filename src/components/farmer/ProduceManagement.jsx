import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Edit, Eye, Camera, Package } from 'lucide-react'
import { CONTRACT_ABI, PRODUCE_TYPE_LABELS } from '../../config/contract'
import { useContract } from '../../hooks/useContract'
import ProduceModal from '../marketplace/ProduceModal'
import EditProduceModal from './EditProduceModal'
import AddImagesModal from './AddImagesModal'

const ProduceManagement = () => {
  const { address } = useAccount()
  const { address: contractAddress, abi, isSupported } = useContract()
  const [selectedProduce, setSelectedProduce] = useState(null)
  const [editingProduce, setEditingProduce] = useState(null)
  const [addingImagesTo, setAddingImagesTo] = useState(null)
  const [farmerProduces, setFarmerProduces] = useState([])
  const [loading, setLoading] = useState(true)

  // Get farmer's produces directly from the contract using getProducesByOwner
  const { data: farmerProducesData, isLoading: isLoadingProduces, refetch: refetchProduces, error: producesError } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getProducesByOwner',
    args: [address],
    enabled: !!address && isSupported
  })

  // Debug logging
  useEffect(() => {
    console.log('🔍 ProduceManagement Debug:', {
      address,
      contractAddress,
      isSupported,
      farmerProducesData,
      isLoadingProduces,
      producesError
    })

    // Additional debugging for data structure
    if (farmerProducesData && farmerProducesData.length > 0) {
      console.log('🔍 First produce item structure:', farmerProducesData[0])
      console.log('🔍 First produce keys:', Object.keys(farmerProducesData[0]))
    }
  }, [address, contractAddress, isSupported, farmerProducesData, isLoadingProduces, producesError])

  // Process the farmer's produces data
  useEffect(() => {
    if (farmerProducesData) {
      console.log('🔍 Raw farmer produces data:', farmerProducesData)

      // Format the produces data - getProducesByOwner returns objects, not arrays
      const formattedProduces = farmerProducesData
        .filter(produce => produce && produce.id && Number(produce.id) > 0) // Filter valid produces by ID
        .map((produce) => {
          const formatted = {
            id: Number(produce.id),
            name: produce.name,
            produceType: Number(produce.produceType),
            originFarm: produce.originFarm,
            grade: produce.grade,
            harvestTime: Number(produce.harvestTime),
            currentOwner: produce.currentOwner,
            currentPrice: produce.currentPrice.toString(),
            status: Number(produce.status),
            trace: produce.trace,
            imageURIs: produce.imageURIs,
            labCertUri: produce.labCertUri,
            totalQuantityKg: Number(produce.totalQuantityKg),
            availableQuantityKg: Number(produce.availableQuantityKg)
          }

          console.log('📊 Formatted produce:', formatted)
          return formatted
        })

      console.log('📊 ProduceManagement: All processed produces:', formattedProduces)
      setFarmerProduces(formattedProduces)
      setLoading(false)
    } else if (!isLoadingProduces && address) {
      setFarmerProduces([])
      setLoading(false)
    }
  }, [farmerProducesData, isLoadingProduces, address])

  // Set loading state based on contract loading
  useEffect(() => {
    setLoading(isLoadingProduces)
  }, [isLoadingProduces])

  // Refetch data when modals close (to update the list after edits)
  const handleModalClose = (modalSetter) => {
    modalSetter(null)
    refetchProduces()
  }

  const formatPrice = (price) => {
    return `${(Number(price) / 1e18).toFixed(3)}`
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">My Produce</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">My Produce</h3>
      </div>

      {farmerProduces.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No produce registered yet</h4>
          <p className="text-gray-600 mb-4">Start by adding your first produce to the marketplace</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmerProduces.map((produce) => (
            <div key={produce.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{produce.name}</h4>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-1 inline-block">
                    {PRODUCE_TYPE_LABELS[produce.produceType] || 'Other'}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(produce.grade)}`}>
                  {produce.produceType === 9 ? `Condition ${produce.grade}` : `Grade ${produce.grade}`}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span>{Number(produce.availableQuantityKg)} {produce.produceType === 9 ? 'units' : 'kg'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{Number(produce.totalQuantityKg)} {produce.produceType === 9 ? 'units' : 'kg'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>{formatPrice(produce.currentPrice)} ETH{produce.produceType === 9 ? '' : '/kg'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{produce.produceType == 9 ? 'Owner:' : 'Farm:'}</span>
                  <span className="truncate ml-2">{produce.originFarm}</span>
                </div>
              </div>

              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => setSelectedProduce(produce.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  View
                </button>
                <button
                  onClick={() => setEditingProduce(produce.id)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  <Edit className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
              </div>

              <button
                onClick={() => setAddingImagesTo(produce.id)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                <Camera className="h-4 w-4 inline mr-1" />
                Add Images
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedProduce && (
        <ProduceModal
          produceId={selectedProduce}
          onClose={() => handleModalClose(setSelectedProduce)}
        />
      )}

      {editingProduce && (
        <EditProduceModal
          produceId={editingProduce}
          onClose={() => handleModalClose(setEditingProduce)}
        />
      )}

      {addingImagesTo && (
        <AddImagesModal
          produceId={addingImagesTo}
          onClose={() => handleModalClose(setAddingImagesTo)}
        />
      )}
    </div>
  )
}

export default ProduceManagement