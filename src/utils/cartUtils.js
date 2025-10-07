// Cart utility functions
export const validateCartItem = (product, quantity) => {
  const errors = [];
  
  if (!product) {
    errors.push('Product not found');
    return { isValid: false, errors };
  }
  
  if (!product.availability?.inStock) {
    errors.push('Product is out of stock');
  }
  
  if (quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (quantity > (product.availability?.quantity || 0)) {
    errors.push(`Only ${product.availability?.quantity || 0} items available`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    maxQuantity: product.availability?.quantity || 0
  };
};

export const calculateDeliveryFee = (subtotal, deliveryMethod = 'delivery') => {
  if (deliveryMethod === 'pickup') return 0;
  return subtotal >= 50 ? 0 : 5; // Free delivery for orders $50+
};

export const calculateTax = (subtotal, taxRate = 0.08) => {
  return subtotal * taxRate;
};

export const formatCartForCheckout = (cartItems) => {
  return cartItems.map(item => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    seller: item.seller,
    availability: item.availability,
    category: item.category,
  }));
};

export const groupCartItemsBySeller = (items) => {
  return items.reduce((acc, item) => {
    const sellerId = item.seller.id;
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: item.seller,
        items: [],
        subtotal: 0,
      };
    }
    acc[sellerId].items.push(item);
    acc[sellerId].subtotal += item.price * item.quantity;
    return acc;
  }, {});
};

export const validateCartStock = async (cartItems, productService) => {
  const validationResults = [];
  
  for (const item of cartItems) {
    try {
      const productResponse = await productService.getProduct(item.productId);
      const product = productResponse.data;
      
      const validation = validateCartItem(product, item.quantity);
      validationResults.push({
        productId: item.productId,
        ...validation,
        currentStock: product.availability?.quantity || 0,
      });
    } catch (error) {
      validationResults.push({
        productId: item.productId,
        isValid: false,
        errors: ['Product not available'],
        currentStock: 0,
      });
    }
  }
  
  return validationResults;
};
