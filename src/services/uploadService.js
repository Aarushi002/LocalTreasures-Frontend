import api from './api';

// Upload product images
export const uploadProductImages = async (images) => {
  try {
    const formData = new FormData();
    
    // Add each image to the form data
    images.forEach((image, index) => {
      formData.append('images', image.file);
    });

    const response = await api.post('/upload/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data: response  // response is already the data due to interceptor
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload images'
    };
  }
};

// Delete product image
export const deleteProductImage = async (filename) => {
  try {
    const response = await api.delete(`/upload/products/${filename}`);
    return {
      success: true,
      data: response  // response is already the data due to interceptor
    };
  } catch (error) {
    console.error('Image delete error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete image'
    };
  }
};

const uploadService = {
  uploadProductImages,
  deleteProductImage
};

export default uploadService;
