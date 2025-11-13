import MarketPriceChart from './MarketPriceChart'

const ChartShowcase = () => {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Price Chart Showcase</h2>
        <p className="text-gray-600">Interactive charts showing live agricultural commodity prices from Indian Mandis</p>
      </div>

      {/* Bar Chart */}
      <div>
        <MarketPriceChart 
          title="Bar Chart - Commodity Price Comparison" 
          chartType="bar"
          className="mb-8"
        />
      </div>

      {/* Line Chart */}
      <div>
        <MarketPriceChart 
          title="Line Chart - Price Trends Analysis" 
          chartType="line"
          className="mb-8"
        />
      </div>

      {/* Doughnut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MarketPriceChart 
          title="Doughnut Chart - Market Distribution" 
          chartType="doughnut"
        />
        <MarketPriceChart 
          title="Interactive Price Chart" 
          chartType="bar"
        />
      </div>
    </div>
  )
}

export default ChartShowcase