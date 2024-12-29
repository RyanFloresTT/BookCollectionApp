import React, { useState } from 'react';
import { Avatar, Menu, MenuItem, Typography, Divider, Box, useTheme } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth0 } from '@auth0/auth0-react';
import { SettingsDialog } from '../Settings/SettingsDialog';

interface UserMenuProps {
  user: {
    picture?: string;
    name?: string;
    email?: string;
  };
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const theme = useTheme();
  const { logout } = useAuth0();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const handleSettingsClick = () => {
    handleClose();
    setSettingsOpen(true);
  };

  return (
    <Box sx={{ ml: 2 }}>
      <Avatar
        src={user?.picture}
        alt={user?.name}
        onClick={handleMenu}
        sx={{ 
          cursor: 'pointer',
          border: `2px solid ${theme.palette.primary.contrastText}`,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="textSecondary">
            {user?.name || user?.email}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSettingsClick}>
          <SettingsIcon sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
}; 