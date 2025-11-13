import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { X, ChevronLeft } from 'lucide-react'
import { CONTRACT_ABI, PRODUCE_TYPES, PRODUCE_TYPE_LABELS } from '../../config/contract'
import { useContract } from '../../hooks/useContract'
import FileUpload from '../common/FileUpload'

const AddProduceModal = ({ onClose, onSuccess }) => {
  const { address: contractAddress } = useContract()
  const [formData, setFormData] = useState({
    name: '',
    produceType: PRODUCE_TYPES.VEGETABLE,
    originFarm: '',
    grade: 'A',
    pricePerKg: '',
    labCertUri: '',
    totalQuantityKg: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [certificateUploaded, setCertificateUploaded] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Save current body overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow

    // Disable body scroll
    document.body.style.overflow = 'hidden'

    // Cleanup function to restore original overflow
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  const { writeContract, data: hash } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCertificateUpload = (uploadResult) => {
    console.log('📄 AddProduceModal: Certificate uploaded successfully', {
      fileName: uploadResult.fileName,
      ipfsHash: uploadResult.ipfsHash,
      publicUrl: uploadResult.publicUrl
    });
    
    setFormData(prev => ({
      ...prev,
      labCertUri: uploadResult.publicUrl
    }))
    setCertificateUploaded(true)
    
    console.log('✅ AddProduceModal: Certificate state updated', {
      certificateUploaded: true,
      labCertUri: uploadResult.publicUrl
    });
  }

  const handleCertificateUploadError = (error) => {
    console.error('Certificate upload error:', error)
    setCertificateUploaded(false)
  }



  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('🚀 AddProduceModal: Form submitted', {
      formData: formData,
      certificateUploaded: certificateUploaded
    });

    try {
      setIsSubmitting(true)

      // Convert price to wei (assuming price is in ETH)
      const priceInWei = BigInt(Math.floor(parseFloat(formData.pricePerKg) * 1e18))
      
      console.log('📝 AddProduceModal: Calling smart contract...', {
        contractAddress: contractAddress,
        functionName: 'registerProduce',
        args: {
          name: formData.name,
          produceType: formData.produceType,
          originFarm: formData.originFarm,
          grade: formData.grade,
          priceInWei: priceInWei.toString(),
          labCertUri: formData.labCertUri,
          totalQuantityKg: formData.totalQuantityKg
        }
      });

      await writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'registerProduce',
        args: [
          formData.name,
          formData.produceType,
          formData.originFarm,
          formData.grade,
          priceInWei,
          formData.labCertUri,
          BigInt(formData.totalQuantityKg)
        ]
      })
      
      console.log('✅ AddProduceModal: Contract call initiated successfully');
      
    } catch (error) {
      console.error('❌ AddProduceModal: Error registering produce:', error)
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto overflow-x-hidden">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-green-600 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Produce Added Successfully!</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">Your produce has been registered on the blockchain. You can now add images to showcase your produce.</p>
            <button
              onClick={() => {
                onClose()
                if (onSuccess) onSuccess()
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto overflow-x-hidden">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Add New Produce</h1>
              </div>
              <div className="flex items-center space-x-4">

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm">
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produce Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Organic Tomatoes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produce Type *
                    </label>
                    <select
                      name="produceType"
                      value={formData.produceType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {Object.entries(PRODUCE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origin Farm *
                    </label>
                    <input
                      type="text"
                      name="originFarm"
                      value={formData.originFarm}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Green Valley Farm"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Quantity */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Pricing & Quantity</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade *
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="A+">A+ Grade</option>
                      <option value="A">A Grade</option>
                      <option value="B+">B+ Grade</option>
                      <option value="B">B Grade</option>
                      <option value="C">C Grade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per KG (ETH) *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      name="pricePerKg"
                      value={formData.pricePerKg}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Quantity (KG) *
                    </label>
                    <input
                      type="number"
                      name="totalQuantityKg"
                      value={formData.totalQuantityKg}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              {/* Lab Certificate */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Quality Certification</h2>
                <FileUpload
                  onUploadSuccess={handleCertificateUpload}
                  onUploadError={handleCertificateUploadError}
                  acceptedTypes=".pdf,.doc,.docx,image/*"
                  maxSize={50}
                  multiple={false}
                  label="Lab Certificate *"
                  description="Upload your quality certification document (PDF, DOC, DOCX, or image). This will be stored on IPFS via Pinata."
                />
                {/* {certificateUploaded && formData.labCertUri && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Certificate uploaded successfully! 
                      <a 
                        href={formData.labCertUri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-green-600 hover:text-green-700 underline"
                      >
                        View Certificate
                      </a>
                    </p>
                  </div>
                )} */}
              </div>

              {/* Note about images */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-3 text-lg">📸 About Product Images</h4>
                <p className="text-blue-800">
                  After creating your produce, you'll be able to add images to showcase your product.
                  This helps buyers make informed decisions and increases your sales potential.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-6 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isConfirming || !certificateUploaded}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
                >
                  {isSubmitting || isConfirming ? 'Adding Produce...' : 'Add Produce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProduceModal