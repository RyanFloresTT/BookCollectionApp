import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSettings } from './ThemeSettings';
import { ThemeProvider } from '../../context/ThemeContext';
import { MemoryRouter } from 'react-router-dom';

describe('ThemeSettings', () => {
  const onCloseMock = jest.fn();
  const onThemeChangeMock = jest.fn();
  const onColorChangeMock = jest.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
    onThemeChangeMock.mockClear();
    onColorChangeMock.mockClear();
  });

  test('renders the theme settings', () => {
    render(
      <MemoryRouter>
        <ThemeProvider isPremium={false}>
          <ThemeSettings currentTheme="light" onThemeChange={onThemeChangeMock} currentColor="purple" onColorChange={onColorChangeMock} isPremium={false} onClose={onCloseMock} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Check if the theme settings is rendered
    expect(screen.getByText(/Theme Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Color/i)).toBeInTheDocument();
    expect(screen.getByText(/Light/i)).toBeInTheDocument();
    expect(screen.getByText(/Dark/i)).toBeInTheDocument();
  });

  test('renders color options', () => {
    render(
      <MemoryRouter>
        <ThemeProvider isPremium={false}>
          <ThemeSettings currentTheme="light" onThemeChange={onThemeChangeMock} currentColor="purple" onColorChange={onColorChangeMock} isPremium={false} onClose={onCloseMock} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Check if the color options are rendered
    expect(screen.getByText(/Purple/i)).toBeInTheDocument();
    expect(screen.getByText(/Red/i)).toBeInTheDocument();
    expect(screen.getByText(/Green/i)).toBeInTheDocument();
    expect(screen.getByText(/Blue/i)).toBeInTheDocument();
  });

  test('handles theme change', () => {
    render(
      <MemoryRouter>
        <ThemeProvider isPremium={false}>
          <ThemeSettings currentTheme="light" onThemeChange={onThemeChangeMock} currentColor="purple" onColorChange={onColorChangeMock} isPremium={false} onClose={onCloseMock} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Click on the "Dark" button
    fireEvent.click(screen.getByText(/Dark/i));

    // Check if the onThemeChange function is called
    expect(onThemeChangeMock).toHaveBeenCalledTimes(1);
  });
});
