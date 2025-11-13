import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon, polygonAmoy, mainnet, sepolia, base, baseSepolia } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

// Get projectId from environment
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

if (!projectId) {
  throw new Error('VITE_REOWN_PROJECT_ID is not set')
}

// Set up the networks - prioritize Ethereum Sepolia as default, then Polygon, then Base
const networks = [sepolia, polygonAmoy, baseSepolia, polygon, mainnet, base]

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false
})

// Create modal with enhanced configuration
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'AgriChain',
    description: 'Blockchain-based Agricultural Supply Chain Platform',
    url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  },
  features: {
    analytics: true,
    email: false,
    socials: []
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#16a34a',
    '--w3m-color-mix': '#ffffff',
    '--w3m-color-mix-strength': 0,
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
    '--w3m-border-radius-master': '12px'
  }
})

// Export config
export const config = wagmiAdapter.wagmiConfig

// Create query client with better error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

// Export modal for direct access if needed
export { modal }