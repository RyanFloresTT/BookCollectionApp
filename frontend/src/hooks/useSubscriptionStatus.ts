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
      console.log('Subscription check - Auth state:', { isAuthenticated, isLoading });
      
      // Don't check subscription while auth is still loading
      if (isLoading) {
        console.log('Subscription check - Auth is still loading');
        return;
      }

      if (!isAuthenticated) {
        console.log('Subscription check - User is not authenticated');
        setStatus('free');
        return;
      }

      // Get URL parameters
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment_status');

      try {
        // If redirected from successful payment, add retry logic
        if (paymentStatus === 'success') {
          console.log('Payment success detected, starting subscription check with retries');
          let attempts = 0;
          const maxAttempts = 5;

          while (attempts < maxAttempts) {
            try {
              console.log(`Attempt ${attempts + 1}: Getting access token`);
              const token = await getAccessTokenSilently();
              console.log('Access token received:', token.slice(0, 10) + '...');
              
              console.log(`Attempt ${attempts + 1}: Checking subscription status`);
              const response = await api.get('/checkout/subscription-status');
              console.log('Subscription status response:', response.data);

              if (response.data?.status === 'active') {
                setStatus('premium');
                return;
              }

              // If not active yet, wait and retry
              await delay(2000); // Wait 2 seconds between attempts
              attempts++;
            } catch (error) {
              console.error(`Attempt ${attempts + 1} failed:`, error);
              attempts++;
              if (attempts === maxAttempts) throw error;
            }
          }
          // If we get here, all retries failed
          throw new Error('Subscription not activated after maximum retries');
        } else {
          // Normal subscription check
          console.log('Getting access token for normal subscription check');
          const token = await getAccessTokenSilently();
          console.log('Access token received:', token.slice(0, 10) + '...');
          
          console.log('Making subscription status request');
          const response = await api.get('/checkout/subscription-status');
          console.log('Subscription status response:', response.data);

          if (response.data?.status === 'active') {
            setStatus('premium');
          } else {
            setStatus('free');
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            // @ts-ignore
            response: error.response?.data,
            // @ts-ignore
            status: error.response?.status
          });
        }
        setStatus('error');
      }
    };

    checkSubscription();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return status;
}; 