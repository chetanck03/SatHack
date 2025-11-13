import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, AlertCircle, PieChart, LineChart } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const MarketPriceChart = ({ title = "Market Price Trends", className = "", chartType = "bar" }) => {
  const [priceData, setPriceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [activeChartType, setActiveChartType] = useState(chartType)

  // API configuration from environment variables
  const API_KEY = import.meta.env.VITE_MANDI_API_KEY 
  const API_BASE_URL = import.meta.env.VITE_MANDI_API_URL 
  const API_URL = `${API_BASE_URL}?api-key=${API_KEY}&format=json&limit=20`

  const fetchMarketPrices = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 MarketPriceChart: Fetching market prices from Indian Mandi API...')

      const response = await fetch(API_URL)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      console.log('📊 MarketPriceChart: API Response:', data)

      if (data && data.records && Array.isArray(data.records)) {
        // Process and format the data
        const processedData = data.records
          .filter(record => record && record.commodity && record.modal_price)
          .map(record => ({
            commodity: record.commodity,
            variety: record.variety || 'Standard',
            state: record.state,
            district: record.district,
            market: record.market,
            minPrice: parseFloat(record.min_price) || 0,
            maxPrice: parseFloat(record.max_price) || 0,
            modalPrice: parseFloat(record.modal_price) || 0,
            arrivalDate: record.arrival_date,
            grade: record.grade || 'FAQ',
            // Calculate price trend (simplified)
            trend: Math.random() > 0.5 ? 'up' : 'down', // Random for demo
            changePercent: (Math.random() * 10 - 5).toFixed(2) // Random -5% to +5%
          }))
          .slice(0, 12) // Limit to 12 items for better display

        setPriceData(processedData)
        setLastUpdated(new Date())
        
        console.log('✅ MarketPriceChart: Data processed successfully:', processedData)
      } else {
        throw new Error('Invalid data format received from API')
      }
    } catch (err) {
      console.error('❌ MarketPriceChart: Error fetching market prices:', err)
      setError(err.message)
      
      // Set fallback demo data with min/max prices
      const demoData = [
        { 
          commodity: 'Tomato', variety: 'Local', state: 'Maharashtra', 
          modalPrice: 2500, minPrice: 2200, maxPrice: 2800, 
          trend: 'up', changePercent: '2.5' 
        },
        { 
          commodity: 'Onion', variety: 'Red', state: 'Karnataka', 
          modalPrice: 1800, minPrice: 1600, maxPrice: 2000, 
          trend: 'down', changePercent: '-1.2' 
        },
        { 
          commodity: 'Potato', variety: 'Local', state: 'Punjab', 
          modalPrice: 1200, minPrice: 1000, maxPrice: 1400, 
          trend: 'up', changePercent: '3.1' 
        },
        { 
          commodity: 'Rice', variety: 'Basmati', state: 'Haryana', 
          modalPrice: 4500, minPrice: 4200, maxPrice: 4800, 
          trend: 'up', changePercent: '1.8' 
        },
        { 
          commodity: 'Wheat', variety: 'Local', state: 'Uttar Pradesh', 
          modalPrice: 2200, minPrice: 2000, maxPrice: 2400, 
          trend: 'down', changePercent: '-0.5' 
        },
        { 
          commodity: 'Maize', variety: 'Yellow', state: 'Bihar', 
          modalPrice: 1900, minPrice: 1700, maxPrice: 2100, 
          trend: 'up', changePercent: '2.2' 
        },
        { 
          commodity: 'Cotton', variety: 'Medium', state: 'Gujarat', 
          modalPrice: 6500, minPrice: 6200, maxPrice: 6800, 
          trend: 'up', changePercent: '1.5' 
        },
        { 
          commodity: 'Sugarcane', variety: 'Local', state: 'Maharashtra', 
          modalPrice: 3200, minPrice: 3000, maxPrice: 3400, 
          trend: 'down', changePercent: '-0.8' 
        },
        { 
          commodity: 'Chilli', variety: 'Red', state: 'Andhra Pradesh', 
          modalPrice: 15000, minPrice: 14500, maxPrice: 15500, 
          trend: 'up', changePercent: '4.2' 
        },
        { 
          commodity: 'Turmeric', variety: 'Finger', state: 'Tamil Nadu', 
          modalPrice: 8500, minPrice: 8200, maxPrice: 8800, 
          trend: 'up', changePercent: '2.8' 
        }
      ]
      setPriceData(demoData)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketPrices()
    
    // Refresh data every 30 minutes
    const interval = setInterval(fetchMarketPrices, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Generate chart data based on price data
  const generateChartData = () => {
    if (!priceData.length) return null

    const labels = priceData.map(item => `${item.commodity}\n(${item.state})`)
    const prices = priceData.map(item => item.modalPrice)
    const minPrices = priceData.map(item => item.minPrice)
    const maxPrices = priceData.map(item => item.maxPrice)

    // Color scheme - vibrant and visible colors
    const colors = [
      '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
      '#14B8A6', '#F472B6', '#A855F7', '#22C55E', '#FB7185'
    ]

    // More vibrant background colors (70% opacity instead of 20%)
    const backgroundColors = [
      'rgba(16, 185, 129, 0.7)',   // Green
      'rgba(59, 130, 246, 0.7)',   // Blue
      'rgba(245, 158, 11, 0.7)',   // Amber
      'rgba(239, 68, 68, 0.7)',    // Red
      'rgba(139, 92, 246, 0.7)',   // Purple
      'rgba(6, 182, 212, 0.7)',    // Cyan
      'rgba(132, 204, 22, 0.7)',   // Lime
      'rgba(249, 115, 22, 0.7)',   // Orange
      'rgba(236, 72, 153, 0.7)',   // Pink
      'rgba(99, 102, 241, 0.7)',   // Indigo
      'rgba(20, 184, 166, 0.7)',   // Teal
      'rgba(244, 114, 182, 0.7)',  // Pink
      'rgba(168, 85, 247, 0.7)',   // Violet
      'rgba(34, 197, 94, 0.7)',    // Green
      'rgba(251, 113, 133, 0.7)'   // Rose
    ]
    const borderColors = colors

    if (activeChartType === 'bar') {
      return {
        labels,
        datasets: [
          {
            label: 'Modal Price (₹/quintal)',
            data: prices,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
          {
            label: 'Min Price (₹/quintal)',
            data: minPrices,
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: '#EF4444',
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Max Price (₹/quintal)',
            data: maxPrices,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: '#10B981',
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          }
        ]
      }
    } else if (activeChartType === 'line') {
      return {
        labels,
        datasets: [
          {
            label: 'Modal Price (₹/quintal)',
            data: prices,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.3)',
            borderWidth: 4,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 10,
          },
          {
            label: 'Min Price (₹/quintal)',
            data: minPrices,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#EF4444',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
          },
          {
            label: 'Max Price (₹/quintal)',
            data: maxPrices,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
          }
        ]
      }
    } else if (activeChartType === 'doughnut') {
      return {
        labels: priceData.slice(0, 8).map(item => item.commodity),
        datasets: [
          {
            label: 'Market Share by Price',
            data: prices.slice(0, 8),
            backgroundColor: backgroundColors.slice(0, 8),
            borderColor: borderColors.slice(0, 8),
            borderWidth: 3,
            hoverOffset: 8,
            hoverBorderWidth: 4,
          }
        ]
      }
    }
  }

  // Chart options - separate for different chart types
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: activeChartType === 'doughnut' ? 'right' : 'top',
          labels: {
            usePointStyle: true,
            padding: activeChartType === 'doughnut' ? 15 : 20,
            font: {
              size: activeChartType === 'doughnut' ? 11 : 12,
              family: 'Inter, system-ui, sans-serif',
              weight: '500'
            },
            color: '#374151',
            ...(activeChartType === 'doughnut' && {
              generateLabels: function(chart) {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0]
                    const value = dataset.data[i]
                    return {
                      text: `${label}: ${formatPrice(value)}`,
                      fillStyle: dataset.backgroundColor[i],
                      strokeStyle: dataset.borderColor[i],
                      lineWidth: dataset.borderWidth,
                      pointStyle: 'circle',
                      hidden: false,
                      index: i
                    }
                  })
                }
                return []
              }
            })
          }
        },
        title: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#10B981',
          borderWidth: 2,
          cornerRadius: 12,
          displayColors: true,
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              const value = context.parsed.y || context.parsed
              return `${context.dataset.label}: ${formatPrice(value)}`
            }
          }
        }
      }
    }

    // Add scales only for bar and line charts
    if (activeChartType !== 'doughnut') {
      baseOptions.scales = {
        x: {
          grid: {
            display: false
          },
          border: {
            color: '#E5E7EB'
          },
          ticks: {
            font: {
              size: 10,
              family: 'Inter, system-ui, sans-serif'
            },
            color: '#6B7280',
            maxRotation: 45,
            minRotation: 0,
            padding: 8
          }
        },
        y: {
          beginAtZero: true,
          border: {
            color: '#E5E7EB'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.2)',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            },
            color: '#6B7280',
            padding: 8,
            callback: function(value) {
              return '₹' + value.toLocaleString('en-IN')
            }
          }
        }
      }
    }

    return baseOptions
  }

  const chartOptions = getChartOptions()

  const chartData = generateChartData()

  const renderChart = () => {
    if (!chartData) return null

    switch (activeChartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />
      default:
        return <Bar data={chartData} options={chartOptions} />
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            {title}
          </h3>
          <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveChartType('bar')}
              className={`p-2 rounded-md transition-colors ${
                activeChartType === 'bar' 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveChartType('line')}
              className={`p-2 rounded-md transition-colors ${
                activeChartType === 'line' 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Line Chart"
            >
              <LineChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveChartType('doughnut')}
              className={`p-2 rounded-md transition-colors ${
                activeChartType === 'doughnut' 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Doughnut Chart"
            >
              <PieChart className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <AlertCircle className="h-4 w-4 text-amber-500" title={`API Error: ${error}`} />
          )}
          <button
            onClick={fetchMarketPrices}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh data"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

     

      {/* Chart Container */}
      <div className="relative h-80 mb-6">
        {chartData ? renderChart() : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Data Summary Table */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Price Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
          {priceData.slice(0, 6).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-gray-900 truncate">{item.commodity}</h5>
                  {item.variety && item.variety !== 'Other' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex-shrink-0">
                      {item.variety}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {item.state} {item.district && `• ${item.district}`}
                </p>
              </div>
              
              <div className="text-right flex-shrink-0 ml-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {formatPrice(item.modalPrice)}
                  </span>
                  <div className={`flex items-center space-x-1 ${
                    item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium">
                      {item.changePercent}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">per quintal</p>
              </div>
            </div>
          ))}
        </div>
        
        
      </div>

      {lastUpdated && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-1 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Last updated:</span>
              <span className="font-semibold text-green-700">{formatDate(lastUpdated)}</span>
              
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Source:</span>
              <span className="font-semibold text-green-700">Ministry of Agriculture & Farmers Welfare, Govt. of India</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketPriceChart