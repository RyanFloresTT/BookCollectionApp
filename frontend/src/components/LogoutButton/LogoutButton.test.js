import { render, screen, fireEvent } from '@testing-library/react';
import LogoutButton from './LogoutButton';

describe('LogoutButton', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the button with the correct text', () => {
    render(<LogoutButton />);

    // Check if the button is rendered
    expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
  });
});