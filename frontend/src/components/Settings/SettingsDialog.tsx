import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ThemeSettings } from './ThemeSettings';
import { SubscriptionSettings } from './SubscriptionSettings';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const subscriptionStatus = useSubscriptionStatus();
  const isPremium = subscriptionStatus === 'premium';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Settings</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Theme" />
            <Tab label="Subscription" />
          </Tabs>
        </Box>
        <TabPanel value={activeTab} index={0}>
          <ThemeSettings isPremium={isPremium} onClose={onClose} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <SubscriptionSettings status={subscriptionStatus} onClose={onClose} />
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}; 