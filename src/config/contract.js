import AgriChainABI from '../../contract/AgriChainABI.json'

// Contract addresses for different networks (ordered by priority: Ethereum Sepolia -> Polygon -> Base)
export const CONTRACT_ADDRESSES = {
  11155111: import.meta.env.VITE_ETHEREUM_SEPOLIA_CONTRACT_ADDRESS, // Ethereum Sepolia (Default)
  80002: import.meta.env.VITE_POLYGON_AMOY_CONTRACT_ADDRESS, // Polygon Amoy
  84532: import.meta.env.VITE_BASE_SEPOLIA_CONTRACT_ADDRESS, // Base Sepolia
}

// Get contract address based on current chain
export const getContractAddress = (chainId) => {
  const address = CONTRACT_ADDRESSES[chainId]
  if (!address) {
    console.warn(`⚠️ No contract address configured for chain ID: ${chainId}`)
  }
  return address
}

// Legacy export for backward compatibility - now defaults to Ethereum Sepolia
export const CONTRACT_ADDRESS = import.meta.env.VITE_ETHEREUM_SEPOLIA_CONTRACT_ADDRESS

export const CONTRACT_ABI = AgriChainABI

// Validate ABI
if (!CONTRACT_ABI || !Array.isArray(CONTRACT_ABI)) {
  console.error('❌ Invalid CONTRACT_ABI')
}

export const ROLES = {
  NONE: 0,
  FARMER: 1,
  CONSUMER: 2
}

export const ORDER_STATUS = {
  NONE: 0,
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  REFUNDED: 4,
  COMPLETED: 5
}

export const DELIVERY_STATUS = {
  NONE: 0,
  IN_DELIVERY: 1,
  DELIVERED: 2
}

export const PRODUCE_STATUS = {
  HARVESTED: 0,
  SOLD: 1
}

export const PRODUCE_TYPES = {
  VEGETABLE: 0,
  FRUIT: 1,
  GRAIN: 2,
  DAIRY: 3,
  MEAT: 4,
  HERB: 5,
  SPICE: 6,
  NUT: 7,
  SEED: 8,
  OTHER: 9
}

// Produce type labels for UI
export const PRODUCE_TYPE_LABELS = {
  [PRODUCE_TYPES.VEGETABLE]: 'Vegetable',
  [PRODUCE_TYPES.FRUIT]: 'Fruit',
  [PRODUCE_TYPES.GRAIN]: 'Grain',
  [PRODUCE_TYPES.DAIRY]: 'Dairy',
  [PRODUCE_TYPES.MEAT]: 'Meat',
  [PRODUCE_TYPES.HERB]: 'Herb',
  [PRODUCE_TYPES.SPICE]: 'Spice',
  [PRODUCE_TYPES.NUT]: 'Nut',
  [PRODUCE_TYPES.SEED]: 'Seed',
  [PRODUCE_TYPES.OTHER]: 'Other'
}

// Network information (ordered by priority: Ethereum Sepolia -> Polygon -> Base)
export const SUPPORTED_NETWORKS = {
  11155111: {
    name: 'Ethereum Sepolia',
    shortName: 'Sepolia',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://sepolia.etherscan.io',
    testnet: true,
    priority: 1 // Highest priority (default)
  },
  80002: {
    name: 'Polygon Amoy',
    shortName: 'Amoy',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://amoy.polygonscan.com',
    testnet: true,
    priority: 2 // Second priority
  },
  84532: {
    name: 'Base Sepolia',
    shortName: 'Base Sepolia',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    blockExplorer: 'https://sepolia.basescan.org',
    testnet: true,
    priority: 3 // Third priority
  }
}

// Check if network is supported
export const isSupportedNetwork = (chainId) => {
  return chainId in SUPPORTED_NETWORKS && chainId in CONTRACT_ADDRESSES
}

// Get networks in priority order (Ethereum Sepolia first, then Polygon, then Base)
export const getNetworksInPriorityOrder = () => {
  return Object.entries(SUPPORTED_NETWORKS)
    .sort(([, a], [, b]) => a.priority - b.priority)
    .map(([chainId, network]) => ({ chainId: parseInt(chainId), ...network }))
}

// Get default network (Ethereum Sepolia)
export const getDefaultNetwork = () => {
  return {
    chainId: 11155111,
    ...SUPPORTED_NETWORKS[11155111]
  }
}

// Default chain ID (Ethereum Sepolia)
export const DEFAULT_CHAIN_ID = 11155111