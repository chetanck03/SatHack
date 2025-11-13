import { useChainId, useAccount } from 'wagmi'
import { CONTRACT_ABI, getContractAddress, DEFAULT_CHAIN_ID } from '../config/contract'

export const useContract = () => {
  const { isConnected } = useAccount()
  const connectedChainId = useChainId()
  
  // Use Ethereum Sepolia as default when wallet is not connected
  const chainId = isConnected ? connectedChainId : DEFAULT_CHAIN_ID
  
  const contractAddress = getContractAddress(chainId)
  
  return {
    address: contractAddress,
    abi: CONTRACT_ABI,
    chainId,
    isSupported: !!contractAddress
  }
}

export default useContract