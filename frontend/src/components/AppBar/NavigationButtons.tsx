import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';
import { useAuth0 } from '@auth0/auth0-react';

export const NavigationButtons: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();

  return (
    <>
      {isAuthenticated && (
        <>
          <Button
            color="inherit"
            startIcon={<LibraryBooksIcon />}
            onClick={() => navigate('/collection')}
          >
            Collection
          </Button>
          <Button
            color="inherit"
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/stats')}
          >
            Stats
          </Button>
        </>
      )}
      <Button
        color="inherit"
        startIcon={<StarIcon />}
        onClick={() => navigate('/subscription')}
      >
        Premium
      </Button>
    </>
  );
}; 