import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsDialog } from './SettingsDialog';
import { ThemeProvider } from '../../context/ThemeContext';
import { MemoryRouter } from 'react-router-dom';

describe('SettingsDialog', () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  test('renders the dialog with tabs', () => {
    render(
      <MemoryRouter>
        <ThemeProvider isPremium={false}>
          <SettingsDialog open={true} onClose={onCloseMock} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Check if the dialog title is rendered
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();

    // Check if the tabs are rendered
    expect(screen.getByLabelText('Theme')).toBeInTheDocument();
    expect(screen.getByLabelText(/Subscription/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reading Streak/i)).toBeInTheDocument();
  });

  test('handles tab changes', () => {
    render(
      <MemoryRouter>
        <ThemeProvider isPremium={false}>
          <SettingsDialog open={true} onClose={onCloseMock} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Click on the "Subscription" tab
    fireEvent.click(screen.getByText(/Subscription/i));

    // Check if the SubscriptionSettings component is rendered
    expect(screen.getByText(/Subscription/i)).toBeInTheDocument();
  });

  test('closes the dialog on close button click', () => {
    render(
      <MemoryRouter>
        <ThemeProvider isPremium={false}>
          <SettingsDialog open={true} onClose={onCloseMock} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Click the close button
    fireEvent.click(screen.getByLabelText(/close/i));

    // Check if the onClose function is called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
