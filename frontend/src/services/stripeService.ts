import api from './api';

export const stripeService = {
  createCheckoutSession: async (userId: string, userEmail: string, token: string) => {
    const response = await api.post(
      '/checkout/session',
      { userId, userEmail },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  createCustomerPortalSession: async (token: string) => {
    const response = await api.post(
      '/checkout/portal-session',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}; 