// Network logo exports
export { default as PolygonLogo } from './polygon-logo.svg'
export { default as EthereumLogo } from './ethereum-logo.svg'
export { default as BaseLogo } from './base-logo.svg'

// Network configuration with logos
export const NETWORK_LOGOS = {
  80002: './polygon-logo.svg', // Polygon Amoy
  11155111: './ethereum-logo.svg', // Ethereum Sepolia
  84532: './base-logo.svg', // Base Sepolia
}

export const getNetworkLogo = (chainId) => {
  return NETWORK_LOGOS[chainId] || null
}