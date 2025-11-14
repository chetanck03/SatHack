import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { X, Upload, ChevronLeft, MapPin, Calendar, Package } from 'lucide-react'
import { useContract } from '../../hooks/useContract'
import FileUpload from '../common/FileUpload'

const AddImagesModal = ({ produceId, onClose }) => {
  const { address: contractAddress, abi, isSupported } = useContract()
  const [images, setImages] = useState([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false)
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

  // Get current produce images
  const { data: currentImages } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'getProduceImages',
    args: [produceId],
    enabled: !!produceId && isSupported
  })

  // Get produce details for display
  const { data: rawProduce } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: 'produces',
    args: [produceId],
    enabled: !!produceId && isSupported
  })

  // Parse the array data with correct indices (updated with produceType)
  const produce = rawProduce ? {
    id: rawProduce[0],                    // uint256: id
    name: rawProduce[1],                  // string: name
    produceType: rawProduce[2],           // uint8: produceType
    originFarm: rawProduce[3],            // string: originFarm
    grade: rawProduce[4],                 // string: grade
    harvestTime: rawProduce[5],           // uint256: harvestTime
    currentOwner: rawProduce[6],          // address: currentOwner
    currentPrice: rawProduce[7],          // uint256: currentPrice
    status: rawProduce[8],                // uint8: status
    labCertUri: rawProduce[9],            // string: labCertUri
    totalQuantityKg: rawProduce[10],      // uint256: totalQuantityKg
    availableQuantityKg: rawProduce[11]   // uint256: availableQuantityKg
  } : null

  // Debug logging
  if (rawProduce) {
    console.log('🔍 AddImagesModal Raw Data:', rawProduce)
    console.log('📊 AddImagesModal Parsed Data:', produce)
  }

  const { writeContract, data: hash } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })



  const handleImagesUpload = (uploadResults) => {
    console.log('🖼️ AddImagesModal: Images uploaded successfully', {
      uploadCount: uploadResults.length,
      uploadResults: uploadResults
    });

    const imageUrls = uploadResults.map(result => result.publicUrl)
    console.log('🔗 AddImagesModal: Generated image URLs', imageUrls);

    setUploadedImages(uploadResults)
    setImages(imageUrls)
    setHasUploadedFiles(true)

    console.log('✅ AddImagesModal: State updated', {
      hasUploadedFiles: true,
      imageCount: imageUrls.length
    });
  }

  const handleImagesUploadError = (error) => {
    console.error('Images upload error:', error)
    setHasUploadedFiles(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('🚀 AddImagesModal: Form submitted', {
      produceId: produceId,
      totalImages: images.length,
      uploadedImages: uploadedImages.length,
      hasUploadedFiles: hasUploadedFiles
    });

    // Filter out empty image URLs
    const validImages = images.filter(img => img.trim() !== '')

    console.log('🔍 AddImagesModal: Filtered valid images', {
      originalCount: images.length,
      validCount: validImages.length,
      validImages: validImages
    });

    if (validImages.length === 0) {
      console.warn('⚠️ AddImagesModal: No valid images found');
      alert('Please add at least one image URL')
      return
    }

    try {
      setIsSubmitting(true)

      console.log('📝 AddImagesModal: Calling smart contract...', {
        contractAddress: contractAddress,
        functionName: 'addProduceImages',
        args: [produceId, validImages]
      });

      writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'addProduceImages',
        args: [produceId, validImages]
      })

      console.log('✅ AddImagesModal: Contract call initiated successfully');

    } catch (error) {
      console.error('❌ AddImagesModal: Error adding images to contract:', error)
      setIsSubmitting(false)
    }
  }

  const handleRemoveAllImages = async () => {
    if (!window.confirm('Are you sure you want to remove all images? This action cannot be undone.')) {
      return
    }

    try {
      setIsSubmitting(true)

      writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'removeProduceImages',
        args: [produceId]
      })
    } catch (error) {
      console.error('Error removing images:', error)
      setIsSubmitting(false)
    }
  }

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
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Images Updated Successfully!</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your {produce?.produceType === 9 ? 'machinery' : 'produce'} images have been updated on the blockchain and are now visible to buyers.
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
                  <h1 className="text-3xl font-bold text-gray-900">Manage Images</h1>

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

        {/* Produce Context Card */}
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
                          {produce.produceType === 9 ? `Condition ${produce.grade}` : `Grade ${produce.grade}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{produce.originFarm}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{produce.produceType === 9 ? 'Listed' : 'Harvested'} {formatDate(produce.harvestTime)}</span>
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          <span>{produce.totalQuantityKg} {produce.produceType === 9 ? 'units' : 'kg'} total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(produce.currentPrice)} ETH{produce.produceType === 9 ? '' : '/kg'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            {/* Current Images */}
            {currentImages && currentImages.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Current Images</h3>
                  <button
                    onClick={handleRemoveAllImages}
                    disabled={isSubmitting || isConfirming}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Remove All
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {currentImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/150/100'
                        }}
                      />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white px-1 py-0.5 rounded text-xs">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Add New Images</h3>
                <FileUpload
                  onUploadSuccess={handleImagesUpload}
                  onUploadError={handleImagesUploadError}
                  acceptedTypes="image/*"
                  maxSize={25}
                  multiple={true}
                  label={produce?.produceType === 9 ? "Equipment Images" : "Product Images"}
                  description={produce?.produceType === 9 
                    ? "Upload high-quality images of your machinery. Include photos from multiple angles, close-ups of important features, and any wear or damage to help buyers make informed decisions. Files will be stored on IPFS via Pinata."
                    : "Upload high-quality images of your produce. Multiple images help buyers make informed decisions. Files will be stored on IPFS via Pinata."
                  }
                />

                {/* Show uploaded images preview */}
                {hasUploadedFiles && uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Images Preview</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.publicUrl}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/150/100'
                            }}
                          />
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white px-1 py-0.5 rounded text-xs">
                            {index + 1}
                          </div>
                          <div className="absolute top-1 left-1 bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                            ✓ IPFS
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  disabled={isSubmitting || isConfirming || !hasUploadedFiles}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 text-lg"
                >
                  <Upload className="h-5 w-5" />
                  <span>{isSubmitting || isConfirming ? 'Adding Images...' : 'Add Images'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddImagesModal