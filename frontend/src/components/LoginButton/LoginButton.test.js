import { render, screen, fireEvent } from '@testing-library/react';
import LoginButton from './LoginButton';

describe('LoginButton', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the button with the correct text', () => {
    render(<LoginButton />);

    // Check if the button is rendered
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
  });
});