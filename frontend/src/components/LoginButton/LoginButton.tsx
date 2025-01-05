import React from 'react';
import { Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect();
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleLogin}
    >
      Log In
    </Button>
  );
};

export default LoginButton;
