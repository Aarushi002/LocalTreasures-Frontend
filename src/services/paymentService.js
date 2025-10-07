import api from './api';

const paymentService = {
  // Get available payment methods
  getPaymentMethods: async () => {
    const response = await api.get('/payments/methods');
    return response;
  },

  // Stripe Payment Intent
  createStripePaymentIntent: async (orderId) => {
    const response = await api.post('/payments/stripe/intent', { orderId });
    return response;
  },

  // Confirm Stripe payment
  confirmStripePayment: async (paymentIntentId) => {
    const response = await api.post('/payments/stripe/confirm', { paymentIntentId });
    return response;
  },

  // Create Razorpay order
  createRazorpayOrder: async (orderId) => {
    const response = await api.post('/payments/razorpay/order', { orderId });
    return response;
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (paymentData) => {
    const response = await api.post('/payments/razorpay/verify', paymentData);
    return response;
  },

  // Process refund
  processRefund: async (orderId, reason) => {
    const response = await api.post('/payments/refund', { orderId, reason });
    return response;
  },
};

export default paymentService;
