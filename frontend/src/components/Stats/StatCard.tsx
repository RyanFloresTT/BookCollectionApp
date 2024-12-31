import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

export interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon?: React.ReactElement;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color = '#1976d2' }) => {
  // Generate a lighter version of the color for the gradient
  const lighterColor = color.replace(')', ', 0.8)').replace('rgb', 'rgba');

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${color} 0%, ${lighterColor} 100%)`,
        color: 'white',
        '&:hover': {
          transform: 'translateY(-2px)',
          transition: 'transform 0.2s ease-in-out',
        }
      }}
    >
      {/* Background Icon */}
      {icon && (
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            top: -20,
            opacity: 0.2,
            transform: 'scale(3)',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="subtitle1" 
          gutterBottom
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 'medium'
          }}
        >
          {icon && React.cloneElement(icon, { sx: { fontSize: 20 } })}
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold', color: 'white' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
}; 