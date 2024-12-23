import React from 'react';
import { Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleLogout}
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;
