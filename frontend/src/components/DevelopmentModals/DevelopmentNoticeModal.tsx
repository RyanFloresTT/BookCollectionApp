import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const DevelopmentNoticeModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('hasSeenDevelopmentNotice');
    if (!hasSeenNotice) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenDevelopmentNotice', 'true');
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          p: 4,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          maxWidth: 400,
          mx: 'auto',
          mt: '20%',
          boxShadow: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" gutterBottom color="primary">
          Site Under Development
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          This site is currently under development. Features and data are subject to change, and data may be wiped.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleClose}>
          I Understand
        </Button>
      </Box>
    </Modal>
  );
};

export default DevelopmentNoticeModal;