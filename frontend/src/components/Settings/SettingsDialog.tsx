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
import { StreakSettings } from './StreakSettings';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { useThemeContext } from '../../context/ThemeContext';

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
      style={{ minHeight: '400px' }}
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
  const isPremium = subscriptionStatus.isPremium;
  const { mode: currentTheme, setMode: onThemeChange, color: currentColor, setColor: onColorChange } = useThemeContext();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '600px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        <Typography variant="h6">Settings</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent 
        dividers 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          flexShrink: 0
        }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab aria-label="Theme" label="Theme" />
            <Tab aria-label="Subscription" label="Subscription" />
            <Tab aria-label="Reading Streak" label="Reading Streak" />
          </Tabs>
        </Box>
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          position: 'relative'
        }}>
          <TabPanel value={activeTab} index={0}>
            <ThemeSettings 
              isPremium={isPremium} 
              onClose={onClose}
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              currentColor={currentColor}
              onColorChange={onColorChange}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <SubscriptionSettings status={subscriptionStatus} onClose={onClose} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <StreakSettings isPremium={isPremium} onClose={onClose} />
          </TabPanel>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 