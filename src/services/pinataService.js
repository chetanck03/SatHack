import { PinataSDK } from "pinata-web3";

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY
});

/**
 * Upload a file to Pinata IPFS
 * @param {File} file - The file to upload
 * @param {string} name - Optional name for the file
 * @param {Object} metadata - Optional metadata for the file
 * @returns {Promise<Object>} - Upload result with IPFS hash and gateway URL
 */
export const uploadFileToPinata = async (file, name = null, metadata = {}) => {
  console.log('🔄 Pinata Service: Starting upload...', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    customName: name,
    metadata: metadata
  });

  try {
    if (!file) {
      console.error('❌ Pinata Service: No file provided');
      throw new Error('No file provided');
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      console.error('❌ Pinata Service: File size exceeds limit', {
        fileSize: file.size,
        maxSize: maxSize
      });
      throw new Error('File size exceeds 100MB limit');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Pinata Service: Invalid file type', {
        fileType: file.type,
        allowedTypes: allowedTypes
      });
      throw new Error('File type not supported. Please upload images (JPEG, PNG, GIF, WebP) or documents (PDF, DOC, DOCX)');
    }

    console.log('✅ Pinata Service: File validation passed');

    // Prepare upload options
    const uploadOptions = {
      metadata: {
        name: name || file.name,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          fileSize: file.size.toString(),
          fileType: file.type,
          ...metadata
        }
      }
    };

    console.log('📤 Pinata Service: Uploading to IPFS...', {
      uploadOptions: uploadOptions
    });

    // Upload file to Pinata
    const upload = await pinata.upload.file(file, uploadOptions);
    
    console.log('🎯 Pinata Service: File uploaded to IPFS', {
      ipfsHash: upload.IpfsHash,
      timestamp: upload.Timestamp,
      pinSize: upload.PinSize
    });
    
    // Get the gateway URL
    const gatewayUrl = await pinata.gateways.get(upload.IpfsHash);
    const publicUrl = `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${upload.IpfsHash}`;
    
    console.log('🌐 Pinata Service: Gateway URLs generated', {
      gatewayUrl: gatewayUrl,
      publicUrl: publicUrl
    });
    
    const result = {
      success: true,
      ipfsHash: upload.IpfsHash,
      gatewayUrl: gatewayUrl,
      publicUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString()
    };

    console.log('✅ Pinata Service: Upload completed successfully', result);
    return result;

  } catch (error) {
    console.error('Pinata upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file to IPFS'
    };
  }
};

/**
 * Upload multiple files to Pinata IPFS
 * @param {FileList|Array} files - The files to upload
 * @param {Object} metadata - Optional metadata for all files
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleFilesToPinata = async (files, metadata = {}) => {
  try {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map((file, index) => 
      uploadFileToPinata(file, `${file.name}`, { 
        ...metadata, 
        batchIndex: index.toString() 
      })
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
    
  } catch (error) {
    console.error('Multiple files upload error:', error);
    throw new Error('Failed to upload multiple files');
  }
};

/**
 * Delete a file from Pinata (unpin)
 * @param {string} ipfsHash - The IPFS hash to unpin
 * @returns {Promise<Object>} - Delete result
 */
export const deleteFileFromPinata = async (ipfsHash) => {
  try {
    await pinata.unpin([ipfsHash]);
    return {
      success: true,
      message: 'File successfully deleted from IPFS'
    };
  } catch (error) {
    console.error('Pinata delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file from IPFS'
    };
  }
};

/**
 * Get file info from Pinata
 * @param {string} ipfsHash - The IPFS hash
 * @returns {Promise<Object>} - File information
 */
export const getFileInfo = async (ipfsHash) => {
  try {
    const fileInfo = await pinata.listFiles().ipfsHash(ipfsHash);
    return {
      success: true,
      data: fileInfo
    };
  } catch (error) {
    console.error('Get file info error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get file information'
    };
  }
};

/**
 * Check if Pinata is properly configured
 * @returns {Promise<boolean>} - Configuration status
 */
export const checkPinataConfig = async () => {
  try {
    // Test authentication by trying to list files
    await pinata.listFiles().limit(1);
    return true;
  } catch (error) {
    console.error('Pinata configuration error:', error);
    return false;
  }
};

export default {
  uploadFileToPinata,
  uploadMultipleFilesToPinata,
  deleteFileFromPinata,
  getFileInfo,
  checkPinataConfig
};
