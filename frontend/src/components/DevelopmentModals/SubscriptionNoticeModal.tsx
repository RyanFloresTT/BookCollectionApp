import { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const SubscriptionNoticeModal = () => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
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
          Subscription Notice
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          During development, you will not be charged for subscriptions. Please use the test card 4242 4242 4242 4242 with expiry 12/34 and CVC 567.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleClose}>
          I Understand
        </Button>
      </Box>
    </Modal>
  );
};

export default SubscriptionNoticeModal;