import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { useContract } from '../../hooks/useContract'
import ProduceCard from './ProduceCard'

const FilterableProduceCard = ({ produceId, onClick, filterCriteria, onVisibilityChange }) => {
  const { address: contractAddress, abi } = useContract()
  const [shouldShow, setShouldShow] = useState(true)
  const [produceData, setProduceData] = useState(null)

  // Get produce details for filtering
  const { data: rawProduce } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'produces',
    args: [produceId],
    enabled: !!produceId
  })

  // Parse produce data
  useEffect(() => {
    if (rawProduce) {
      const parsed = {
        id: rawProduce[0],
        name: rawProduce[1]?.toLowerCase() || '',
        produceType: rawProduce[2],
        originFarm: rawProduce[3]?.toLowerCase() || '',
        grade: rawProduce[4] || '',
        currentPrice: rawProduce[7] || 0,
        availableQuantityKg: rawProduce[11] || 0
      }
      setProduceData(parsed)
    }
  }, [rawProduce])

  // Apply filters
  useEffect(() => {
    if (!produceData) {
      setShouldShow(true) // Show while loading
      return
    }

    const { searchTerm, selectedGrade, selectedProduceType, priceRange } = filterCriteria

    // Search filter (name or farm)
    if (searchTerm && !produceData.name.includes(searchTerm) && !produceData.originFarm.includes(searchTerm)) {
      setShouldShow(false)
      return
    }

    // Grade filter
    if (selectedGrade && produceData.grade !== selectedGrade) {
      setShouldShow(false)
      return
    }

    // Produce type filter
    if (selectedProduceType && produceData.produceType.toString() !== selectedProduceType) {
      setShouldShow(false)
      return
    }

    // Price range filter
    if (priceRange) {
      const priceInEth = Number(produceData.currentPrice) / 1e18
      const [min, max] = priceRange.split('-').map(p => p === '+' ? Infinity : parseFloat(p))
      
      if (max === undefined) { // Handle "50+" case
        if (priceInEth < min) {
          setShouldShow(false)
          return
        }
      } else {
        if (priceInEth < min || priceInEth > max) {
          setShouldShow(false)
          return
        }
      }
    }

    // If we get here, all filters passed
    setShouldShow(true)
  }, [produceData, filterCriteria])

  // Report visibility changes
  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(produceId, shouldShow)
    }
  }, [shouldShow, produceId, onVisibilityChange])

  // Don't render if filtered out
  if (!shouldShow) {
    return null
  }

  // Render the normal ProduceCard
  return <ProduceCard produceId={produceId} onClick={onClick} />
}

export default FilterableProduceCard