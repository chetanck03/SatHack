import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { ChevronDown, Copy, ExternalLink, Power, Wallet, ArrowRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

const WalletConnect = () => {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)
  
  // Get wallet balance
  const { data: balance } = useBalance({
    address: address,
    enabled: !!address && isConnected
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await open()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsDropdownOpen(false)
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (balance) => {
    if (!balance) return '0.00'
    const value = parseFloat(balance.formatted)
    if (value < 0.01) return '< 0.01'
    return value.toFixed(2)
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openExplorer = () => {
    if (address && chain?.blockExplorers?.default?.url) {
      window.open(`${chain.blockExplorers.default.url}/address/${address}`, '_blank')
    }
  }

  if (isConnected) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 sm:space-x-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl px-2 sm:px-4 py-2 transition-all duration-200 group"
        >
          {/* Wallet Icon */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm"></div>
          </div>
          
          {/* Balance and Address */}
          <div className="flex flex-col items-start min-w-0">
            <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
              {formatBalance(balance)} {balance?.symbol || 'ETH'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {formatAddress(address)}
            </div>
          </div>
          
          {/* Dropdown Arrow */}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 sm:right-0 -right-2 mt-2 w-80 sm:w-72 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            {/* Account Info */}
            <div className="px-3 sm:px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatBalance(balance)} {balance?.symbol || 'ETH'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {chain?.name || 'Unknown Network'}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="px-3 sm:px-4 py-3 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-2">Wallet Address</div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-2 sm:px-3 py-2">
                <span className="text-xs sm:text-sm font-mono text-gray-700 truncate mr-2">
                  {formatAddress(address)}
                </span>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copy address"
                  >
                    <Copy className="h-3 w-3 text-gray-500" />
                  </button>
                  {chain?.blockExplorers?.default && (
                    <button
                      onClick={openExplorer}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="h-3 w-3 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
              {copied && (
                <div className="text-xs text-emerald-600 mt-1">Address copied!</div>
              )}
            </div>

            {/* Actions */}
            <div className="px-2 py-2">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <Power className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
      {isConnected ? (
        <>
          <Link
            to="/marketplace"
            className="w-full sm:w-auto group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 min-w-[160px] h-[48px] sm:h-[52px]"
          >
            <span className="text-base sm:text-lg">🌾</span>
            <span>Start Trading</span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto group bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 min-w-[160px] h-[48px] sm:h-[52px]"
          >
            <span className="text-base sm:text-lg mr-2">📊</span>
            Dashboard
          </Link>
        </>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 disabled:shadow-md text-base"
        >
          <Wallet className="h-5 w-5" />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>
      )}
    </div>
  )
}

export default WalletConnect