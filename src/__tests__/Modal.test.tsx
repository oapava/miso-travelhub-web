import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@/components/ui/Modal/Modal';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  children: <p>Modal content</p>,
};

describe('Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal {...defaultProps} title="My Title" />);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('does not render title element when title is not provided', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('has dialog role and aria-modal attribute', () => {
    render(<Modal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop (overlay) is clicked', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} dataTestId="modal" />);
    fireEvent.click(screen.getByTestId('modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on non-Escape keydown', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies medium size class by default', () => {
    render(<Modal {...defaultProps} />);
    expect(document.querySelector('.modal--medium')).toBeInTheDocument();
  });

  it('applies small size class when size is small', () => {
    render(<Modal {...defaultProps} size="small" />);
    expect(document.querySelector('.modal--small')).toBeInTheDocument();
  });

  it('applies large size class when size is large', () => {
    render(<Modal {...defaultProps} size="large" />);
    expect(document.querySelector('.modal--large')).toBeInTheDocument();
  });

  it('sets data-testid on the overlay', () => {
    render(<Modal {...defaultProps} dataTestId="test-modal" />);
    expect(screen.getByTestId('test-modal')).toBeInTheDocument();
  });

  it('sets data-testid on the close button', () => {
    render(<Modal {...defaultProps} dataTestId="test-modal" />);
    expect(screen.getByTestId('test-modal-close')).toBeInTheDocument();
  });

  it('sets body overflow to hidden when open', () => {
    render(<Modal {...defaultProps} isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');
  });
});
