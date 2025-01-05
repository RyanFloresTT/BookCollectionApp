import { render, screen, fireEvent } from '@testing-library/react';
import SubscriptionNoticeModal from './SubscriptionNoticeModal';

describe('SubscriptionNoticeModal', () => {
  test('renders the modal and closes on button click', () => {
    render(<SubscriptionNoticeModal />);

    // Check if the modal is open and contains the correct text
    expect(screen.getByText(/Subscription Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/During development, you will not be charged/i)).toBeInTheDocument();

    // Click the "I Understand" button
    fireEvent.click(screen.getByText(/I Understand/i));

    // Check if the modal is closed
    expect(screen.queryByText(/Subscription Notice/i)).not.toBeInTheDocument();
  });
});