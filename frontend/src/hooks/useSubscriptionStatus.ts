import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/api';

type SubscriptionStatus = 'free' | 'premium' | 'loading' | 'error';

export const useSubscriptionStatus = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [status, setStatus] = useState<SubscriptionStatus>('loading');

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated) {
        setStatus('free');
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        const response = await api.get('/checkout/subscription-status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStatus(response.data.status === 'active' ? 'premium' : 'free');
      } catch (error) {
        console.error('Error checking subscription:', error);
        setStatus('error');
      }
    };

    checkSubscription();
  }, [isAuthenticated, getAccessTokenSilently]);

  return status;
}; 