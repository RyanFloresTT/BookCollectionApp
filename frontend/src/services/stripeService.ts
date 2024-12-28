import api from './api';

export const stripeService = {
  async createCheckoutSession(userId: string, userEmail: string, token: string): Promise<{ url: string }> {
    const response = await api.post('/checkout/session', {
      userId,
      userEmail,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  },
}; 