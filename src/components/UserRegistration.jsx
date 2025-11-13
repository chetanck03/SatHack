import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { Sprout, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react'
import { CONTRACT_ABI, ROLES } from '../config/contract'
import { useContract } from '../hooks/useContract'

const UserRegistration = () => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [error, setError] = useState('')
  const { isConnected, chain } = useAccount()
  const { address: contractAddress, abi, isSupported } = useContract()

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleRegister = () => {
    if (!selectedRole) return
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }
    if (!contractAddress || !isSupported) {
      setError('Contract address not configured for this network')
      return
    }

    setError('')

    writeContract({
      address: contractAddress,
      abi: abi,
      functionName: 'registerUser',
      args: [selectedRole]
    }, {
      onError: (error) => {
        console.error('Registration error:', error)
        setError(error.message || 'Registration failed. Please try again.')
      }
    })
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            You have been successfully registered as a {selectedRole === ROLES.FARMER ? 'Farmer' : 'Consumer'}.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-16 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AgriChain</h1>
          <p className="text-gray-600">Choose your role to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Farmer Option */}
          <div
            onClick={() => setSelectedRole(ROLES.FARMER)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === ROLES.FARMER
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
              }`}
          >
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">I'm a Farmer</h3>
              <p className="text-gray-600 mb-4">
                Sell your fresh produce directly to consumers with transparent pricing and secure payments.
              </p>

            </div>
          </div>

          {/* Consumer Option */}
          <div
            onClick={() => setSelectedRole(ROLES.CONSUMER)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === ROLES.CONSUMER
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
          >
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">I'm a Consumer</h3>
              <p className="text-gray-600 mb-4">
                Buy fresh, quality produce directly from verified farmers with full traceability.
              </p>

            </div>
          </div>
        </div>

        {/* Error Message */}
        {(error || writeError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">
              {error || writeError?.message || 'An error occurred during registration'}
            </p>
          </div>
        )}

        {/* Network Info
        {isConnected && chain && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Connected to: <strong>{chain.name}</strong>
              {contractAddress && (
                <span className="block mt-1">
                  Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                </span>
              )}
            </p>
          </div>
        )} */}

        {/* Registration Button */}
        <div className="text-center">
          <button
            onClick={handleRegister}
            disabled={!selectedRole || !isConnected || isPending || isConfirming || !contractAddress || !isSupported}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {isPending || isConfirming
              ? 'Registering...'
              : !isConnected
                ? 'Connect Wallet First'
                : !contractAddress || !isSupported
                  ? 'Contract Not Configured'
                  : selectedRole
                    ? `Register as ${selectedRole === ROLES.FARMER ? 'Farmer' : 'Consumer'}`
                    : 'Select a role to continue'
            }
          </button>

          {selectedRole && isConnected && contractAddress && isSupported && (
            <p className="text-sm text-gray-600 mt-2">
              This will create a blockchain transaction to register your role.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserRegistration