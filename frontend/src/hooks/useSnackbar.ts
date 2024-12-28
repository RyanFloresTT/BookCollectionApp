import { useState } from 'react';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export const useSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<SnackbarSeverity>('info');

  const showSnackbar = (msg: string, sev: SnackbarSeverity = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const hideSnackbar = () => {
    setOpen(false);
  };

  return {
    open,
    message,
    severity,
    showSnackbar,
    hideSnackbar,
  };
}; 