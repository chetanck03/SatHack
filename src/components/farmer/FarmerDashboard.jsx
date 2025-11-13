import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Plus, Package, TrendingUp } from 'lucide-react'
import { CONTRACT_ABI } from '../../config/contract'
import { useContract } from '../../hooks/useContract'
import AddProduceModal from './AddProduceModal'
import ProduceManagement from './ProduceManagement'
import NetworkStatus from '../NetworkStatus'
import MarketPriceChart from '../charts/MarketPriceChart'


const FarmerDashboard = () => {
  const { address } = useAccount()
  const { address: contractAddress, abi, isSupported } = useContract()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddProduce, setShowAddProduce] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalProduce: 0,
    totalSales: 0
  })

  // Get farmer's produces to calculate statistics
  const { data: farmerProducesData } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getProducesByOwner',
    args: [address],
    enabled: !!address && isSupported
  })

  // Calculate dashboard statistics from real blockchain data
  useEffect(() => {
    if (!address || !farmerProducesData) return

    try {
      // Filter valid produces
      const validProduces = farmerProducesData.filter(produce => produce && produce.id && Number(produce.id) > 0)

      // Calculate total sales from sold quantities
      let totalSalesAmount = 0
      validProduces.forEach(produce => {
        const soldQuantity = Number(produce.totalQuantityKg) - Number(produce.availableQuantityKg)
        if (soldQuantity > 0) {
          totalSalesAmount += soldQuantity * Number(produce.currentPrice)
        }
      })

      console.log('📊 FarmerDashboard: Statistics calculated:', {
        totalProduce: validProduces.length,
        totalSales: totalSalesAmount,
        produces: validProduces
      })

      setDashboardStats({
        totalProduce: validProduces.length,
        totalSales: totalSalesAmount
      })
    } catch (error) {
      console.error('Error calculating dashboard stats:', error)
    }
  }, [address, farmerProducesData])

  const formatEthAmount = (weiAmount) => {
    return `${(Number(weiAmount) / 1e18).toFixed(4)} ETH`
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'produce', label: 'My Produce', icon: Package },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
            <p className="text-gray-600">Manage your produce and orders</p>
          </div>
          <button
            onClick={() => setShowAddProduce(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Produce</span>
          </button>
        </div>

         {/* Network Status */}
        <NetworkStatus />

         <div className="mt-6">
                  <MarketPriceChart 
                    title="Agricultural Market Analysis - Live Mandi Prices" 
                    className="w-full"
                    chartType="bar"
                  />
                </div>

       

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Produce</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalProduce}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-semibold text-gray-900">{formatEthAmount(dashboardStats.totalSales)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Market Price Chart at Top */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                  {/* Quick Actions - Now Second */}
                  <div className="lg:col-span-2 lg:order-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={() => setShowAddProduce(true)}
                      className="p-6 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center mb-3">
                        <Plus className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-medium text-gray-900">Add New Produce</h3>
                      </div>
                      <p className="text-sm text-gray-600">List fresh produce in the marketplace</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('produce')}
                      className="p-6 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center mb-3">
                        <Package className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="font-medium text-gray-900">Manage Produce</h3>
                      </div>
                      <p className="text-sm text-gray-600">Update and organize your listings</p>
                    </button>
                  </div>
                </div>

                {/* Full Width Market Analysis */}
               
              </div>
            )}

            {activeTab === 'produce' && <ProduceManagement />}
          </div>
        </div>

        {/* Add Produce Modal */}
        {showAddProduce && (
          <AddProduceModal
            onClose={() => setShowAddProduce(false)}
            onSuccess={() => {
              // Refresh the dashboard data after successful produce creation
              window.location.reload() // Simple refresh for now
            }}
          />
        )}
      </div>
    </div>
  )
}

export default FarmerDashboard