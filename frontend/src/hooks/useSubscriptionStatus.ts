import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/api';

type SubscriptionStatus = 'free' | 'premium' | 'loading' | 'error';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useSubscriptionStatus = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [status, setStatus] = useState<SubscriptionStatus>('loading');

  useEffect(() => {
    const checkSubscription = async () => {
      // Don't check subscription while auth is still loading
      if (isLoading) {
        return;
      }

      if (!isAuthenticated) {
        setStatus('free');
        return;
      }

      // Get URL parameters
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment_status');

      try {
        // If redirected from successful payment, add retry logic
        if (paymentStatus === 'success') {
          let attempts = 0;
          const maxAttempts = 5;

          while (attempts < maxAttempts) {
            try {
              const token = await getAccessTokenSilently();
              const response = await api.get('/checkout/subscription-status');

              if (response.data?.status === 'active') {
                setStatus('premium');
                return;
              }

              // If not active yet, wait and retry
              await delay(2000); // Wait 2 seconds between attempts
              attempts++;
            } catch (error) {
              attempts++;
              if (attempts === maxAttempts) throw error;
            }
          }
          // If we get here, all retries failed
          throw new Error('Subscription not activated after maximum retries');
        } else {
          // Normal subscription check
          const token = await getAccessTokenSilently();
          const response = await api.get('/checkout/subscription-status');

          if (response.data?.status === 'active') {
            setStatus('premium');
          } else {
            setStatus('free');
          }
        }
      } catch (error) {
        setStatus('error');
      }
    };

    checkSubscription();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return status;
}; 