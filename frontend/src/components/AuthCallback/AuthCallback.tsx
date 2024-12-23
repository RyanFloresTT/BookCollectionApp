// src/components/AuthCallback.tsx

import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

const AuthCallback: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(location.search);
      const returnTo = params.get('returnTo') || '/';
      navigate(returnTo);
    }
  }, [isAuthenticated, navigate, location.search]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return <div>Redirecting...</div>;
};

export default AuthCallback;
