import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { uploadFileToPinata } from '../../services/pinataService';

const FileUpload = ({ 
  onUploadSuccess, 
  onUploadError, 
  acceptedTypes = "image/*,.pdf,.doc,.docx",
  maxSize = 100, // MB
  multiple = false,
  label = "Upload File",
  description = "Upload your file to IPFS via Pinata",
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    // Validate file count
    if (!multiple && files.length > 1) {
      setErrorMessage('Please select only one file');
      setUploadStatus('error');
      return;
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" exceeds ${maxSize}MB limit`);
        setUploadStatus('error');
        return;
      }

      // Check file type
      const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
      const isValidType = allowedTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/');
        if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type);
        return file.type === type;
      });

      if (!isValidType) {
        setErrorMessage(`File type "${file.type}" is not supported`);
        setUploadStatus('error');
        return;
      }
    }

    // Start upload
    setUploadStatus('uploading');
    setErrorMessage('');
    setUploadProgress(0);

    try {
      const uploadResults = [];
      
      console.log('🚀 Starting file upload process...', {
        fileCount: files.length,
        multiple: multiple,
        existingUploads: uploadedFiles.length
      });
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📁 Uploading file ${i + 1}/${files.length}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        setUploadProgress(((i + 0.5) / files.length) * 100);
        
        const result = await uploadFileToPinata(file, file.name, {
          uploadedBy: 'AgriChain',
          category: multiple ? 'product-images' : 'certificate'
        });

        if (result.success) {
          console.log('✅ File uploaded successfully:', {
            fileName: result.fileName,
            ipfsHash: result.ipfsHash,
            publicUrl: result.publicUrl
          });
          uploadResults.push(result);
        } else {
          console.error('❌ File upload failed:', result.error);
          throw new Error(result.error);
        }
        
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // For multiple uploads, append to existing files
      // For single uploads, replace existing files
      const allUploadedFiles = multiple ? [...uploadedFiles, ...uploadResults] : uploadResults;
      
      console.log('🎉 All files uploaded successfully:', {
        newUploads: uploadResults.length,
        totalUploads: allUploadedFiles.length,
        allFiles: allUploadedFiles.map(f => ({ name: f.fileName, hash: f.ipfsHash }))
      });
      
      setUploadedFiles(allUploadedFiles);
      setUploadStatus('success');
      
      // Call success callback
      if (onUploadSuccess) {
        if (multiple) {
          console.log('📤 Calling success callback with all files:', allUploadedFiles);
          onUploadSuccess(allUploadedFiles);
        } else {
          console.log('📤 Calling success callback with single file:', uploadResults[0]);
          onUploadSuccess(uploadResults[0]);
        }
      }

    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error.message || 'Failed to upload file');
      setUploadStatus('error');
      
      if (onUploadError) {
        onUploadError(error);
      }
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    // Don't reset uploadedFiles - keep previous uploads
    // setUploadedFiles([]);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAllUploads = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadedFiles([]);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-red-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploadStatus === 'uploading' ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center">
          {uploadStatus === 'uploading' ? (
            <div className="space-y-4">
              <Loader className="h-12 w-12 text-green-500 animate-spin mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Uploading to IPFS...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{Math.round(uploadProgress)}% complete</p>
              </div>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-900">Upload Successful!</p>
                <p className="text-xs text-gray-500">
                  {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded to IPFS
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Drop your file{multiple ? 's' : ''} here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Supports: {acceptedTypes.replace(/,/g, ', ')} • Max size: {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadStatus === 'error' && errorMessage && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMessage}</p>
          <button
            onClick={resetUpload}
            className="ml-auto p-1 hover:bg-red-100 rounded"
          >
            <X className="h-4 w-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Success - Uploaded Files */}
      {uploadStatus === 'success' && uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h4>
            <div className="flex space-x-2">
              {multiple && (
                <button
                  onClick={resetUpload}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Add More Files
                </button>
              )}
              <button
                onClick={clearAllUploads}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                {getFileIcon(file.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>IPFS: {file.ipfsHash.substring(0, 12)}...</span>
                  </div>
                </div>
                <a
                  href={file.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
