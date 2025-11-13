import { useAccount, useChainId } from 'wagmi'
import { AlertTriangle, CheckCircle, ExternalLink, Info } from 'lucide-react'
import { SUPPORTED_NETWORKS, isSupportedNetwork, getContractAddress, DEFAULT_CHAIN_ID } from '../config/contract'
import NetworkIcon from './NetworkIcon'

const NetworkStatus = () => {
  const { isConnected } = useAccount()
  const connectedChainId = useChainId()
  
  // Use default network when not connected
  const chainId = isConnected ? connectedChainId : DEFAULT_CHAIN_ID

  // Show default network info when not connected
  if (!isConnected) {
    const networkInfo = SUPPORTED_NETWORKS[DEFAULT_CHAIN_ID]
    const contractAddress = getContractAddress(DEFAULT_CHAIN_ID)
    const contractExplorerUrl = `${networkInfo.blockExplorer}/address/${contractAddress}`

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <NetworkIcon chainId={DEFAULT_CHAIN_ID} size="w-5 h-5" />
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Browsing {networkInfo.name} Marketplace
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              Connect your wallet to purchase products or switch networks.
            </p>
          </div>
          <a
            href={contractExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors p-1 rounded hover:bg-blue-100"
            title={`View AgriChain contract on ${networkInfo.name} explorer`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    )
  }

  const isSupported = isSupportedNetwork(chainId)
  const networkInfo = SUPPORTED_NETWORKS[chainId]
  const contractAddress = getContractAddress(chainId)

  if (isSupported && contractAddress) {
    // Build the contract explorer URL
    const contractExplorerUrl = `${networkInfo.blockExplorer}/address/${contractAddress}`

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <NetworkIcon chainId={chainId} size="w-5 h-5" />
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Connected to {networkInfo.name}
            </h3>
            <p className="text-sm text-green-600 mt-1">
              You're connected to a supported network. All features are available.
            </p>
          </div>
          <a
            href={contractExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 transition-colors p-1 rounded hover:bg-green-100"
            title={`View AgriChain contract on ${networkInfo.name} explorer`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Unsupported Network
          </h3>
          <p className="text-sm text-yellow-600 mt-1">
            Please switch to one of the supported networks: Ethereum Sepolia, Polygon Amoy, or Base Sepolia.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NetworkStatus