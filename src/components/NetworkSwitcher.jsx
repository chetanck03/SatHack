import { useState, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { ChevronDown, WifiOff } from 'lucide-react'

// Import network logos
import { PolygonLogo, EthereumLogo, BaseLogo } from '../assets/networks'

const NetworkSwitcher = () => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)

  // Supported networks with official logos
  const networks = [
     {
      id: 11155111,
      name: 'Ethereum Sepolia',
      shortName: 'Sepolia',
      logo: EthereumLogo,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    {
      id: 80002,
      name: 'Polygon Amoy',
      shortName: 'Amoy',
      logo: PolygonLogo,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50'
    },
    {
      id: 84532,
      name: 'Base Sepolia',
      shortName: 'Base',
      logo: BaseLogo,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50'
    }
  ]

  const currentNetwork = networks.find(network => network.id === chainId)
  const isUnsupportedNetwork = isConnected && !currentNetwork

  const handleNetworkSwitch = async (networkId) => {
    try {
      await switchChain({ chainId: networkId })
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.network-switcher')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isConnected) {
    return null
  }

  return (
    <div className="relative network-switcher">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isUnsupportedNetwork
            ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            : currentNetwork
            ? `${currentNetwork.bgColor} ${currentNetwork.textColor} border border-gray-200 hover:shadow-md`
            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
        }`}
      >
        {isUnsupportedNetwork ? (
          <WifiOff className="h-4 w-4" />
        ) : currentNetwork ? (
          <img src={currentNetwork.logo} alt={currentNetwork.name} className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        
        <span className="hidden sm:inline">
          {isUnsupportedNetwork 
            ? 'Unsupported Network' 
            : currentNetwork?.shortName || 'Unknown'
          }
        </span>
        
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
            Switch Network
          </div>
          
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() => handleNetworkSwitch(network.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                chainId === network.id ? 'bg-gray-50' : ''
              }`}
            >
              <img src={network.logo} alt={network.name} className="w-5 h-5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{network.name}</div>
                <div className="text-xs text-gray-500">Chain ID: {network.id}</div>
              </div>
              {chainId === network.id && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </button>
          ))}
          
          {isUnsupportedNetwork && (
            <div className="px-3 py-2 mt-2 border-t border-gray-100">
              <div className="text-xs text-red-600 font-medium">
                Current network is not supported
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Please switch to a supported testnet
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NetworkSwitcher