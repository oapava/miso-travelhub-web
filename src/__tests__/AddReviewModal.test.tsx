import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddReviewModal from '@/components/shared/AddReviewModal/AddReviewModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: jest.fn() } }),
}));

const noop = jest.fn();

describe('AddReviewModal', () => {
  beforeEach(() => jest.resetAllMocks());

  it('does not render when isOpen is false', () => {
    render(<AddReviewModal isOpen={false} onClose={noop} onSubmit={noop} />);
    expect(screen.queryByTestId('add-review-modal')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    expect(screen.getByTestId('add-review-modal')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    expect(screen.getByTestId('add-review-modal-title')).toHaveTextContent('Write a Review');
  });

  it('renders 5 star buttons', () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`add-review-modal-star-${i}`)).toBeInTheDocument();
    }
  });

  it('renders the comment textarea', () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    expect(screen.getByTestId('add-review-modal-textarea')).toBeInTheDocument();
  });

  it('renders Cancel and Submit buttons', () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    expect(screen.getByTestId('add-review-modal-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('add-review-modal-submit')).toHaveTextContent('Submit Review');
  });

  it('shows error when Submit clicked without rating', async () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    fireEvent.click(screen.getByTestId('add-review-modal-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('add-review-modal-error')).toHaveTextContent(
        'Please select a star rating.',
      );
    });
  });

  it('shows error when Submit clicked with rating but no comment', async () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    fireEvent.click(screen.getByTestId('add-review-modal-star-3'));
    fireEvent.click(screen.getByTestId('add-review-modal-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('add-review-modal-error')).toHaveTextContent(
        'Please write a comment.',
      );
    });
  });

  it('calls onSubmit with correct rating and comment', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={mockSubmit} />);
    fireEvent.click(screen.getByTestId('add-review-modal-star-4'));
    fireEvent.change(screen.getByTestId('add-review-modal-textarea'), {
      target: { value: 'Great hotel!' },
    });
    fireEvent.click(screen.getByTestId('add-review-modal-submit'));
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(4, 'Great hotel!');
    });
  });

  it('shows success state after successful submit', async () => {
    jest.useFakeTimers();
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={mockSubmit} />);
    fireEvent.click(screen.getByTestId('add-review-modal-star-5'));
    fireEvent.change(screen.getByTestId('add-review-modal-textarea'), {
      target: { value: 'Excellent!' },
    });
    fireEvent.click(screen.getByTestId('add-review-modal-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('add-review-modal-success')).toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  it('shows API error when onSubmit rejects', async () => {
    const mockSubmit = jest.fn().mockRejectedValue(new Error('Server error'));
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={mockSubmit} />);
    fireEvent.click(screen.getByTestId('add-review-modal-star-2'));
    fireEvent.change(screen.getByTestId('add-review-modal-textarea'), {
      target: { value: 'Bad experience' },
    });
    fireEvent.click(screen.getByTestId('add-review-modal-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('add-review-modal-error')).toHaveTextContent('Server error');
    });
  });

  it('shows generic error when onSubmit rejects with non-Error', async () => {
    const mockSubmit = jest.fn().mockRejectedValue('unexpected');
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={mockSubmit} />);
    fireEvent.click(screen.getByTestId('add-review-modal-star-1'));
    fireEvent.change(screen.getByTestId('add-review-modal-textarea'), {
      target: { value: 'Not great' },
    });
    fireEvent.click(screen.getByTestId('add-review-modal-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('add-review-modal-error')).toHaveTextContent(
        'Could not save review',
      );
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    const mockClose = jest.fn();
    render(<AddReviewModal isOpen={true} onClose={mockClose} onSubmit={noop} />);
    fireEvent.click(screen.getByTestId('add-review-modal-cancel'));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('disables buttons while loading', async () => {
    let resolve!: () => void;
    const mockSubmit = jest.fn(
      () => new Promise<void>((res) => { resolve = res; }),
    );
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={mockSubmit} />);
    fireEvent.click(screen.getByTestId('add-review-modal-star-3'));
    fireEvent.change(screen.getByTestId('add-review-modal-textarea'), {
      target: { value: 'Loading test' },
    });
    fireEvent.click(screen.getByTestId('add-review-modal-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('add-review-modal-submit')).toHaveTextContent('Submitting...');
    });
    await act(async () => resolve());
  });

  it('shows character count', () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    expect(screen.getByTestId('add-review-modal-char-count')).toHaveTextContent('0/500');
    fireEvent.change(screen.getByTestId('add-review-modal-textarea'), {
      target: { value: 'Hello' },
    });
    expect(screen.getByTestId('add-review-modal-char-count')).toHaveTextContent('5/500');
  });

  it('uses custom dataTestId prefix', () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} dataTestId="my-modal" />);
    expect(screen.getByTestId('my-modal')).toBeInTheDocument();
    expect(screen.getByTestId('my-modal-star-1')).toBeInTheDocument();
  });

  it('highlights stars on mouse enter', () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    fireEvent.mouseEnter(screen.getByTestId('add-review-modal-star-3'));
    // Stars 1, 2, 3 should now have the active class (hovered = 3)
    expect(screen.getByTestId('add-review-modal-star-3').className).toContain('--active');
    expect(screen.getByTestId('add-review-modal-star-1').className).toContain('--active');
  });

  it('removes hover highlight on mouse leave', () => {
    render(<AddReviewModal isOpen={true} onClose={noop} onSubmit={noop} />);
    fireEvent.mouseEnter(screen.getByTestId('add-review-modal-star-3'));
    fireEvent.mouseLeave(screen.getByTestId('add-review-modal-star-3'));
    // No hover active class on star 3 unless it was clicked
    expect(screen.getByTestId('add-review-modal-star-3').className).not.toContain('--active');
  });
});
