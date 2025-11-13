import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { ShoppingCart, Package, Clock, TrendingUp, Heart, ArrowRight } from 'lucide-react'
import { ORDER_STATUS, DELIVERY_STATUS, ROLES } from '../../config/contract'
import { useContract } from '../../hooks/useContract'
import { useOrders } from '../../hooks/useOrders'
import { useOrderStatusCounts } from '../../hooks/useOrderStatusCounts'
import NetworkStatus from '../NetworkStatus'
import { Link } from 'react-router-dom'
import ConsumerOrderCard from './ConsumerOrderCard'
import MarketPriceChart from '../charts/MarketPriceChart'

const ConsumerDashboard = () => {
  const { address } = useAccount()
  const { address: contractAddress, abi, isSupported } = useContract()
  const [activeTab, setActiveTab] = useState('overview')
  const [totalSpent, setTotalSpent] = useState(0)
  const [recentOrders, setRecentOrders] = useState([])

  // Get user orders and counts
  const { orders, loading, userRole } = useOrders()
  const { statusCounts, updateOrderCount, resetCounts } = useOrderStatusCounts()

  // Get total produce count for recommendations
  const { data: produceCount } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'produceCount',
    enabled: isSupported
  })

  // Reset counts when component mounts
  useEffect(() => {
    resetCounts()
  }, [resetCounts])

  // Calculate total spent from orders
  useEffect(() => {
    const calculateTotalSpent = async () => {
      if (!orders.length || !contractAddress || !abi) return

      let total = 0
      const recentOrdersData = []

      // Get data for recent orders (last 5)
      const recentOrderIds = orders.slice(-5).reverse()

      for (const order of recentOrderIds) {
        try {
          // This would need to be implemented with actual contract calls
          // For now, we'll use the order counting system
          recentOrdersData.push({
            id: order.id,
            status: 'loading'
          })
        } catch (error) {
          console.error('Error fetching order data:', error)
        }
      }

      setRecentOrders(recentOrdersData)
    }

    calculateTotalSpent()
  }, [orders, contractAddress, abi])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'orders', label: 'My Orders', icon: ShoppingCart },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ]

  const formatPrice = (price) => {
    if (!price || price === 0 || price === '0') return '0.00'

    let priceNumber
    if (typeof price === 'bigint') {
      priceNumber = Number(price.toString())
    } else {
      priceNumber = Number(price)
    }

    const ethValue = priceNumber / 1e18
    return ethValue.toFixed(4)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consumer Dashboard</h1>
          <p className="text-gray-600">Track your orders and discover fresh produce</p>
        </div>

        {/* Network Status */}
        <NetworkStatus />

                <div>
                    <MarketPriceChart 
                      title="Market Price Insights" 
                      className="h-full"
                      chartType="bar"
                    />
                  </div> 

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : statusCounts.all}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : statusCounts.active}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : statusCounts.completed}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : statusCounts.pending}
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
                      Order Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Orders:</span>
                        <span className="font-semibold text-gray-900">{statusCounts.all}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-semibold text-green-600">{statusCounts.completed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">In Progress:</span>
                        <span className="font-semibold text-blue-600">{statusCounts.active}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending:</span>
                        <span className="font-semibold text-orange-600">{statusCounts.pending}</span>
                      </div>
                    </div>
                    {statusCounts.all > 0 && (
                      <Link
                        to="/orders"
                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        View All Orders
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Link
                        to="/marketplace"
                        className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Browse Marketplace
                      </Link>
                      <Link
                        to="/orders"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Track Orders
                      </Link>
                      <button
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                        disabled
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites (Coming Soon)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Marketplace Preview */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Fresh Produce Available</h3>
                    <Link
                      to="/marketplace"
                      className="text-green-600 hover:text-green-700 font-medium flex items-center"
                    >
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  {produceCount && Number(produceCount) > 0 ? (
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <Package className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">
                        {Number(produceCount)} fresh produce items available
                      </p>
                      <p className="text-green-600 text-sm">
                        Discover quality produce from verified farmers
                      </p>
                      <Link
                        to="/marketplace"
                        className="mt-3 inline-flex bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No produce available at the moment</p>
                      <p className="text-gray-500 text-sm">Check back later for fresh items</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="text-center py-12">
                {statusCounts.all > 0 ? (
                  <div>
                    <ShoppingCart className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">You have {statusCounts.all} orders</h3>
                    <p className="text-gray-600 mb-4">View detailed order information and track deliveries</p>
                    <Link
                      to="/orders"
                      className="inline-flex bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      View All Orders
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                ) : (
                  <div>
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">Start shopping to see your order history</p>
                    <Link
                      to="/marketplace"
                      className="inline-flex bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Browse Marketplace
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Favorites Coming Soon</h3>
                <p className="text-gray-600 mb-4">We're working on a feature to save your favorite farms and produce</p>
                <Link
                  to="/marketplace"
                  className="inline-flex bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Explore Marketplace
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Hidden order cards for counting - they report status but don't render visually */}
        <div style={{ display: 'none' }}>
          {orders.map(order => (
            <ConsumerOrderCard
              key={order.id}
              order={order}
              onStatusUpdate={updateOrderCount}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConsumerDashboard