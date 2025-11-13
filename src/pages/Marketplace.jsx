import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Search, Package, X } from 'lucide-react'
import { useContract } from '../hooks/useContract'
import FilterableProduceCard from '../components/marketplace/FilterableProduceCard'
import ProduceModal from '../components/marketplace/ProduceModal'
import NetworkStatus from '../components/NetworkStatus'
import { useVisibleCount } from '../hooks/useVisibleCount'

const Marketplace = () => {
  useAccount() // Keep for wallet connection status
  const { address: contractAddress, abi, isSupported } = useContract()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedProduceType, setSelectedProduceType] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [selectedProduce, setSelectedProduce] = useState(null)
  const [produces, setProduces] = useState([])
  const { visibleCount, registerVisible, registerHidden, reset } = useVisibleCount()

  // Get total produce count (works without wallet connection)
  const { data: produceCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'produceCount',
    enabled: isSupported // Remove wallet connection requirement
  })

  // Create filter criteria object
  const filterCriteria = {
    searchTerm: searchTerm.toLowerCase().trim(),
    selectedGrade,
    selectedProduceType,
    priceRange
  }

  // Check if any filters are active
  const hasFilters = searchTerm || selectedGrade || selectedProduceType || priceRange

  // Handle visibility changes from FilterableProduceCard components
  const handleVisibilityChange = useCallback((produceId, isVisible) => {
    if (isVisible) {
      registerVisible(produceId)
    } else {
      registerHidden(produceId)
    }
  }, [registerVisible, registerHidden])

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedGrade('')
    setSelectedProduceType('')
    setPriceRange('')
  }

  // Reset visible count when produce count changes
  useEffect(() => {
    reset()
  }, [produceCount, reset])

  // Fetch all produces - create list of IDs for ProduceCard to fetch individually
  useEffect(() => {
    if (produceCount) {
      const produceList = []
      // Only show produces that exist (have been created)
      for (let i = 1; i <= Number(produceCount); i++) {
        produceList.push({ id: i })
      }
      setProduces(produceList)
    } else {
      setProduces([])
    }
  }, [produceCount]) // Remove isConnected dependency

  const grades = ['A+', 'A', 'B+', 'B', 'C']
  const produceTypes = [
    { label: '🥬 Vegetables', value: '0' },
    { label: '🍎 Fruits', value: '1' },
    { label: '🌾 Grains', value: '2' },
    { label: '🥛 Dairy', value: '3' },
    { label: '🥩 Meat', value: '4' },
    { label: '🐟 Seafood', value: '5' },
    { label: '🌿 Herbs', value: '6' },
    { label: '🥜 Nuts', value: '7' },
    { label: '🍯 Other', value: '8' }
  ]
  const priceRanges = [
    { label: 'Under 0.01 ETH', value: '0-0.01' },
    { label: '0.01 - 0.05 ETH', value: '0.01-0.05' },
    { label: '0.05 - 0.1 ETH', value: '0.05-0.1' },
    { label: 'Over 0.1 ETH', value: '0.1+' }
  ]

  // Allow browsing marketplace without wallet connection
  // Wallet is only required for purchasing

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Fresh Produce Marketplace</h1>
              <p className="text-gray-600">Discover fresh, quality produce directly from verified farmers</p>
            </div>

          </div>
        </div>

        {/* Network Status */}
        <NetworkStatus />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search produce..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Grade Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade} Grade</option>
              ))}
            </select>

            {/* Produce Type Filter */}
            <select
              value={selectedProduceType}
              onChange={(e) => setSelectedProduceType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {produceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Prices</option>
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedGrade && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Grade: {selectedGrade}
                </span>
              )}
              {selectedProduceType && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Type: {produceTypes.find(t => t.value === selectedProduceType)?.label}
                </span>
              )}
              {priceRange && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Price: {priceRanges.find(r => r.value === priceRange)?.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {produceCount && Number(produceCount) > 0
              ? `Showing ${visibleCount} of ${Number(produceCount)} produce items`
              : 'No produce items available'
            }
            {visibleCount === 0 && hasFilters && Number(produceCount) > 0 && (
              <span className="text-orange-600 ml-2">- No items match your filters</span>
            )}
          </p>
        </div>



        {/* Produce Grid */}
        {produceCount && Number(produceCount) > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produces.map(produce => (
              <FilterableProduceCard
                key={produce.id}
                produceId={produce.id}
                filterCriteria={filterCriteria}
                onVisibilityChange={handleVisibilityChange}
                onClick={() => setSelectedProduce(produce.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No produce available</h3>
            <p className="text-gray-600 mb-4">
              {!produceCount || Number(produceCount) === 0
                ? 'No farmers have registered their produce yet. Be the first to add your produce to the marketplace!'
                : 'Try adjusting your search criteria'
              }
            </p>
            {(!produceCount || Number(produceCount) === 0) && (
              <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>For farmers:</strong> Register as a farmer and add your produce to get started!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Produce Detail Modal */}
        {selectedProduce && (
          <ProduceModal
            produceId={selectedProduce}
            onClose={() => setSelectedProduce(null)}
          />
        )}
      </div>
    </div>
  )
}

export default Marketplace