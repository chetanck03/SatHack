import { PolygonLogo, EthereumLogo, BaseLogo } from '../assets/networks'

const NetworkIcon = ({ chainId, size = 'w-5 h-5', className = '' }) => {
    const getNetworkLogo = (chainId) => {
        switch (chainId) {
            case 80002: // Polygon Amoy
                return { logo: PolygonLogo, name: 'Polygon Amoy' }
            case 11155111: // Ethereum Sepolia
                return { logo: EthereumLogo, name: 'Ethereum Sepolia' }
            case 84532: // Base Sepolia
                return { logo: BaseLogo, name: 'Base Sepolia' }
            default:
                return null
        }
    }

    const network = getNetworkLogo(chainId)

    if (!network) {
        return (
            <div className={`${size} ${className} bg-gray-300 rounded-full flex items-center justify-center`}>
                <span className="text-xs text-gray-600">?</span>
            </div>
        )
    }

    return (
        <img
            src={network.logo}
            alt={network.name}
            className={`${size} ${className}`}
        />
    )
}

export default NetworkIcon