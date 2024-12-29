import React, { createContext, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material/styles';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type ColorOption = 'blue' | 'green' | 'purple' | 'red';
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  color: ColorOption;
  setColor: (color: ColorOption) => void;
  isPremium: boolean;
}

// Predefined theme colors
const themeColors = {
  blue: {
    light: {
      primary: '#1976d2',
      secondary: '#9c27b0',
    },
    dark: {
      primary: '#90caf9',
      secondary: '#ce93d8',
    }
  },
  green: {
    light: {
      primary: '#2e7d32',
      secondary: '#f57c00',
    },
    dark: {
      primary: '#66bb6a',
      secondary: '#ffb74d',
    }
  },
  purple: {
    light: {
      primary: '#7b1fa2',
      secondary: '#0288d1',
    },
    dark: {
      primary: '#ba68c8',
      secondary: '#4fc3f7',
    }
  },
  red: {
    light: {
      primary: '#d32f2f',
      secondary: '#388e3c',
    },
    dark: {
      primary: '#ef5350',
      secondary: '#66bb6a',
    }
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  isPremium: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, isPremium }) => {
  const [mode, setMode] = useLocalStorage<ThemeMode>('themeMode', 'light');
  const [color, setColor] = useLocalStorage<ColorOption>('themeColor', 'blue');

  const theme = React.useMemo(() => {
    const colors = themeColors[color];
    const currentColors = mode === 'dark' ? colors.dark : colors.light;

    return createTheme({
      palette: {
        mode,
        primary: {
          main: currentColors.primary,
        },
        secondary: {
          main: currentColors.secondary,
        },
      },
    });
  }, [mode, color]);

  const value = React.useMemo(() => ({
    mode,
    setMode,
    color,
    setColor,
    isPremium,
  }), [mode, setMode, color, setColor, isPremium]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 