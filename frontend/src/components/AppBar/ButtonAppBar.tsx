import React from 'react';
import { Box, AppBar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LoginIcon from '@mui/icons-material/Login';
import { StyledToolbar, LogoLink } from './styles';
import { UserMenu } from './UserMenu';
import { NavigationButtons } from './NavigationButtons';

export default function ButtonAppBar() {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  return (
    <AppBar position="static" elevation={2}>
      <StyledToolbar>
        <LogoLink href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <LibraryBooksIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Book Collection
          </Typography>
        </LogoLink>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NavigationButtons />
          {isAuthenticated ? (
            <UserMenu user={user || {}} />
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => loginWithRedirect()}
              sx={{ 
                borderRadius: 2,
                px: 3,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </StyledToolbar>
    </AppBar>
  );
}
