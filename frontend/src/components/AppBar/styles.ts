import { styled } from '@mui/material/styles';
import { Toolbar, Link } from '@mui/material';

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'space-between',
  '& .MuiButton-root': {
    margin: theme.spacing(0, 1),
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
}));

export const LogoLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  textDecoration: 'none',
  color: 'inherit',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
})); 