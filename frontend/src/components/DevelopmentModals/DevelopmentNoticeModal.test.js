import { render, screen, fireEvent } from '@testing-library/react';
import DevelopmentNoticeModal from './DevelopmentNoticeModal';

describe('DevelopmentNoticeModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the modal and closes on button click', () => {
    render(<DevelopmentNoticeModal />);

    // Check if the modal is open and contains the correct text
    expect(screen.getByText(/Site Under Development/i)).toBeInTheDocument();
    expect(screen.getByText(/This site is currently under development/i)).toBeInTheDocument();

    // Click the "I Understand" button
    fireEvent.click(screen.getByText(/I Understand/i));

    // Check if the modal is closed
    expect(screen.queryByText(/Site Under Development/i)).not.toBeInTheDocument();
  });

  test('sets localStorage after closing', () => {
    render(<DevelopmentNoticeModal />);

    // Click the "I Understand" button
    fireEvent.click(screen.getByText(/I Understand/i));

    // Check if localStorage is set
    expect(localStorage.getItem('hasSeenDevelopmentNotice')).toBe('true');
  });
});