import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface FeatureSectionProps {
  title: string;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  icon,
  action,
  children
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" color="primary">
          {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Paper>
  );
}; 