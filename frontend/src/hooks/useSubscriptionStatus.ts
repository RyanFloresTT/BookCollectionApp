import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/api';

interface SubscriptionStatus {
  isPremium: boolean;
  loading: boolean;
  error: string | null;
}

export const useSubscriptionStatus = (): SubscriptionStatus => {
  const { getAccessTokenSilently } = useAuth0();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const { data } = await api.get('/checkout/subscription-status');
        setStatus({
          isPremium: data.status === 'active',
          loading: false,
          error: null
        });
      } catch (err) {
        setStatus({
          isPremium: false,
          loading: false,
          error: err instanceof Error ? err.message : 'An error occurred'
        });
      }
    };

    fetchSubscriptionStatus();
  }, [getAccessTokenSilently]);

  return status;
}; 