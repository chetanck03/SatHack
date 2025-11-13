import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { User, Package, ShoppingCart, Plus } from 'lucide-react'
import { CONTRACT_ABI, ROLES } from '../config/contract'
import { useContract } from '../hooks/useContract'
import UserRegistration from '../components/UserRegistration'
import FarmerDashboard from '../components/farmer/FarmerDashboard'
import ConsumerDashboard from '../components/consumer/ConsumerDashboard'
import NetworkStatus from '../components/NetworkStatus'

const Dashboard = () => {
  const { address, isConnected } = useAccount()
  const { address: contractAddress, abi, isSupported } = useContract()

  // Get user role
  const { data: userRole, isLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'userRoles',
    args: [address],
    enabled: isConnected && !!address && isSupported
  })

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access your dashboard</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // User not registered
  if (!userRole || userRole === ROLES.NONE) {
    return <UserRegistration />
  }

  // Farmer Dashboard
  if (userRole === ROLES.FARMER) {
    return <FarmerDashboard />
  }

  // Consumer Dashboard
  if (userRole === ROLES.CONSUMER) {
    return <ConsumerDashboard />
  }

  return null
}

export default Dashboard