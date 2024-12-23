import React from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '../../components/LogoutButton/LogoutButton';
import LoginButton from '../../components/LoginButton/LoginButton';

export default function ButtonAppBar() {
  const { isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
          </IconButton>
          <Link
            href="/"
            color="inherit"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}
          >
            <Typography variant="h6" component="div">
              Book Collection App
            </Typography>
          </Link>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated ? (
              <React.Fragment>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Welcome, {user?.name || user?.nickname || user?.email || 'User'}!
                </Typography>
                <Button
                  color="inherit"
                  onClick={() => navigate('/collection')}
                  sx={{ mr: 2 }}
                >
                  View Collection
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/stats')}
                  sx={{ mr: 2 }}
                >
                  Stats
                </Button>
                <LogoutButton />
              </React.Fragment>
            ) : (
              <LoginButton />
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
