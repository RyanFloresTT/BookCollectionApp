import { render, screen, fireEvent } from '@testing-library/react';
import { SubscriptionSettings } from './SubscriptionSettings';
import { ThemeProvider } from '../../context/ThemeContext';
import { MemoryRouter } from 'react-router-dom';

describe('SubscriptionSettings', () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  test('renders the subscription settings', () => {
    render(
      <MemoryRouter>
        <ThemeProvider isPremium={false}>
          <SubscriptionSettings status={{ isPremium: false, loading: false, error: null }} onClose={onCloseMock} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // Check if the subscription settings is rendered
    expect(screen.getByLabelText(/Current Plan/i)).toBeInTheDocument();
  });
});
