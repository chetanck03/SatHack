import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { X, ChevronLeft, MapPin, Calendar, Package } from 'lucide-react'
import { CONTRACT_ABI, PRODUCE_TYPES, PRODUCE_TYPE_LABELS } from '../../config/contract'
import { useContract } from '../../hooks/useContract'
import FileUpload from '../common/FileUpload'

const EditProduceModal = ({ produceId, onClose }) => {
  const { address: contractAddress } = useContract()
  const [formData, setFormData] = useState({
    name: '',
    produceType: PRODUCE_TYPES.VEGETABLE,
    grade: 'A',
    pricePerKg: '',
    totalQuantityKg: '',
    labCertUri: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormInitialized, setIsFormInitialized] = useState(false)
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

  // Get current produce details
  const { data: rawProduce, isLoading: isLoadingProduce } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'produces',
    args: [produceId]
  })

  // Parse the array data into an object (updated with produceType)
  const produce = rawProduce ? {
    id: rawProduce[0],
    name: rawProduce[1],
    produceType: rawProduce[2],
    originFarm: rawProduce[3],
    grade: rawProduce[4],
    harvestTime: rawProduce[5],
    currentOwner: rawProduce[6],
    currentPrice: rawProduce[7],
    status: rawProduce[8],
    trace: rawProduce[9],
    imageURIs: rawProduce[10],
    labCertUri: rawProduce[11],
    totalQuantityKg: rawProduce[12],
    availableQuantityKg: rawProduce[13]
  } : null

  const { writeContract, data: hash } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Populate form with current data
  useEffect(() => {
    if (produce && produce.name && !isFormInitialized) {
      console.log('Populating form with produce data:', produce) // Debug log
      setFormData({
        name: produce.name || '',
        produceType: produce.produceType || PRODUCE_TYPES.VEGETABLE,
        grade: produce.grade || 'A',
        pricePerKg: (Number(produce.currentPrice) / 1e18).toString(),
        totalQuantityKg: Number(produce.totalQuantityKg).toString(),
        labCertUri: produce.labCertUri || ''
      })
      setIsFormInitialized(true)
    }
  }, [produce, isFormInitialized])

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === '0') return 'Not set'
    try {
      const timestampNum = Number(timestamp)
      if (isNaN(timestampNum) || timestampNum === 0) return 'Not set'

      const date = new Date(timestampNum * 1000)
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }

      return date.toLocaleDateString('en-US', options)
    } catch (error) {
      console.error('Error formatting date:', error, timestamp)
      return 'Invalid date'
    }
  }

  const formatPrice = (price) => {
    if (!price || price === '0') return '0.00'
    try {
      const priceNum = Number(price)
      if (isNaN(priceNum)) return '0.00'
      return `${(priceNum / 1e18).toFixed(3)}`
    } catch (error) {
      console.error('Error formatting price:', error, price)
      return '0.00'
    }
  }

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-blue-100 text-blue-800',
      'B+': 'bg-yellow-100 text-yellow-800',
      'B': 'bg-orange-100 text-orange-800',
      'C': 'bg-red-100 text-red-800'
    }
    return colors[grade] || 'bg-gray-100 text-gray-800'
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log('Input change:', name, value) // Debug log
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      
      // When switching to machinery, set default condition
      if (name === 'produceType' && value == PRODUCE_TYPES.MACHINERY) {
        newData.grade = 'Good'
      }
      // When switching away from machinery, set default grade
      else if (name === 'produceType' && prev.produceType == PRODUCE_TYPES.MACHINERY && value != PRODUCE_TYPES.MACHINERY) {
        newData.grade = 'A'
      }
      
      return newData
    })
  }

  const handleCertificateUpload = (uploadResult) => {
    console.log('📄 EditProduceModal: Certificate uploaded successfully', {
      fileName: uploadResult.fileName,
      ipfsHash: uploadResult.ipfsHash,
      publicUrl: uploadResult.publicUrl
    });
    
    setFormData(prev => ({
      ...prev,
      labCertUri: uploadResult.publicUrl
    }))
    setCertificateUploaded(true)
    
    console.log('✅ EditProduceModal: Certificate state updated', {
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

    console.log('🚀 EditProduceModal: Form submitted', {
      produceId: produceId,
      formData: formData,
      certificateUploaded: certificateUploaded
    });

    try {
      setIsSubmitting(true)

      // Convert price to wei
      const priceInWei = BigInt(Math.floor(parseFloat(formData.pricePerKg) * 1e18))
      
      console.log('📝 EditProduceModal: Calling smart contract...', {
        contractAddress: contractAddress,
        functionName: 'editProduce',
        args: {
          produceId: produceId,
          name: formData.name,
          produceType: formData.produceType,
          grade: formData.grade,
          priceInWei: priceInWei.toString(),
          totalQuantityKg: formData.totalQuantityKg,
          labCertUri: formData.labCertUri
        }
      });

      await writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'editProduce',
        args: [
          produceId,
          formData.name,
          formData.produceType,
          formData.grade,
          priceInWei,
          BigInt(formData.totalQuantityKg),
          formData.labCertUri
        ]
      })
      
      console.log('✅ EditProduceModal: Contract call initiated successfully');
      
    } catch (error) {
      console.error('❌ EditProduceModal: Error editing produce:', error)
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
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Machinery Updated Successfully!' : 'Produce Updated Successfully!'}
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {formData.produceType == PRODUCE_TYPES.MACHINERY 
                ? 'Your machinery information has been updated on the blockchain and is now visible to buyers with the new details.'
                : 'Your produce information has been updated on the blockchain and is now visible to buyers with the new details.'
              }
            </p>
            <button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while data is being fetched
  if (isLoadingProduce || !produce) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto overflow-x-hidden">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading produce details...</p>
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
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Edit Machinery' : 'Edit Produce'}
                  </h1>

                </div>
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

        {/* Current Produce Context Card */}
        {produce && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{produce.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(produce.grade)}`}>
                          {produce.produceType == PRODUCE_TYPES.MACHINERY ? `Condition: ${produce.grade}` : `Grade ${produce.grade}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{produce.originFarm}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{produce.produceType == PRODUCE_TYPES.MACHINERY ? 'Listed' : 'Harvested'} {formatDate(produce.harvestTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          <span>{produce.availableQuantityKg} {produce.produceType == PRODUCE_TYPES.MACHINERY ? 'units' : 'kg'} available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(produce.currentPrice)} ETH{produce.produceType == PRODUCE_TYPES.MACHINERY ? '' : '/kg'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Current Price
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm">
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Machinery Name *' : 'Produce Name *'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Item Type *' : 'Produce Type *'}
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
                      {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Condition *' : 'Grade *'}
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {formData.produceType == PRODUCE_TYPES.MACHINERY ? (
                        <>
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                          <option value="For Parts">For Parts</option>
                        </>
                      ) : (
                        <>
                          <option value="A+">A+ Grade</option>
                          <option value="A">A Grade</option>
                          <option value="B+">B+ Grade</option>
                          <option value="B">B Grade</option>
                          <option value="C">C Grade</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Quantity */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">Pricing & Quantity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Price (ETH) *' : 'Price per KG (ETH) *'}
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      name="pricePerKg"
                      value={formData.pricePerKg}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Quantity (Units) *' : 'Total Quantity (KG) *'}
                    </label>
                    <input
                      type="number"
                      name="totalQuantityKg"
                      value={formData.totalQuantityKg}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Quality Certification */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                  {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Documentation' : 'Quality Certification'}
                </h2>

                {/* Current Certificate Display */}
                {formData.labCertUri && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Current Documentation' : 'Current Certificate'}
                        </p>
                        {/* <p className="text-xs text-blue-700 break-all mb-2">{formData.labCertUri}</p> */}
                        <a 
                          href={formData.labCertUri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {formData.produceType == PRODUCE_TYPES.MACHINERY ? 'View Current Documentation' : 'View Current Certificate'}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Upload Section */}
                <div>
                  <FileUpload
                    onUploadSuccess={handleCertificateUpload}
                    onUploadError={handleCertificateUploadError}
                    acceptedTypes=".pdf,.doc,.docx,image/*"
                    maxSize={50}
                    multiple={false}
                    label={formData.produceType == PRODUCE_TYPES.MACHINERY ? "Upload New Documentation *" : "Upload New Lab Certificate *"}
                    description={formData.produceType == PRODUCE_TYPES.MACHINERY 
                      ? "Upload new maintenance records, manual, or other documentation (PDF, DOC, DOCX, or image). This will replace the current documentation and be stored on IPFS via Pinata."
                      : "Upload a new quality certification document (PDF, DOC, DOCX, or image). This will replace the current certificate and be stored on IPFS via Pinata."
                    }
                  />
                  {/* {certificateUploaded && formData.labCertUri && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ New certificate uploaded successfully! 
                        <a 
                          href={formData.labCertUri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-green-600 hover:text-green-700 underline"
                        >
                          View New Certificate
                        </a>
                      </p>
                    </div>
                  )} */}
                </div>
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
                  disabled={isSubmitting || isConfirming || !formData.labCertUri}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
                >
                  {isSubmitting || isConfirming 
                    ? 'Updating...' 
                    : (formData.produceType == PRODUCE_TYPES.MACHINERY ? 'Update Machinery' : 'Update Produce')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProduceModal