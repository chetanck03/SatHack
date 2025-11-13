import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { useContract } from './useContract'

export const useProduceList = () => {
  const { address: contractAddress, abi, isSupported } = useContract()
  const [produces, setProduces] = useState([])
  const [loading, setLoading] = useState(true)

  // Get total produce count
  const { data: produceCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'produceCount',
    enabled: isSupported
  })

  // Fetch all produce details
  useEffect(() => {
    const fetchAllProduces = async () => {
      if (!produceCount || !isSupported) {
        setProduces([])
        setLoading(false)
        return
      }

      setLoading(true)
      const producePromises = []
      
      // Create promises to fetch all produces
      for (let i = 1; i <= Number(produceCount); i++) {
        producePromises.push(
          fetch(`/api/produce/${i}`) // This would be replaced with actual contract call
            .catch(() => null) // Handle errors gracefully
        )
      }

      try {
        // For now, we'll create a simplified version that works with the current architecture
        const produceList = []
        for (let i = 1; i <= Number(produceCount); i++) {
          produceList.push({
            id: i,
            // We'll add a flag to indicate this needs to be fetched by ProduceCard
            needsFetch: true
          })
        }
        
        setProduces(produceList)
      } catch (error) {
        console.error('Error fetching produces:', error)
        setProduces([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllProduces()
  }, [produceCount, isSupported])

  return { produces, loading, produceCount }
}