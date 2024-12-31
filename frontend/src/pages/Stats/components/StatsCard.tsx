import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => (
  <Paper 
    elevation={2}
    sx={{ 
      p: 3, 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}
  >
    {icon && (
      <Box sx={{ color: 'primary.main', mb: 2 }}>
        {icon}
      </Box>
    )}
    <Typography 
      variant="h6" 
      gutterBottom 
      color="primary.main"
      sx={{ 
        fontWeight: 'medium',
        mb: 2
      }}
    >
      {title}
    </Typography>
    <Typography 
      variant="body1" 
      sx={{ 
        fontSize: '1.1rem',
        fontWeight: 'medium'
      }}
    >
      {value}
    </Typography>
  </Paper>
); 