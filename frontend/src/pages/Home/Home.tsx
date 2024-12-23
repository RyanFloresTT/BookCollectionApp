import React from 'react';
import { Box, Typography } from '@mui/material';
import ManualBookEntry from '../../components/ManualBookEntry/ManualBookEntry';

const Home: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f5f5f5"
      padding={2}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to Your Book Collection!
      </Typography>
      <Typography variant="h6" component="p" gutterBottom>
        Add your latest book below
      </Typography>
      <ManualBookEntry />
    </Box>
  );
};

export default Home;
