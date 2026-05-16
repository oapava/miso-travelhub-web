import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from '@/components/ui/Toast/Toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders with the provided message', () => {
    render(<Toast message="Something went wrong" onClose={jest.fn()} />);
    expect(screen.getByTestId('toast-message')).toHaveTextContent('Something went wrong');
  });

  it('renders with default info variant', () => {
    render(<Toast message="Info" onClose={jest.fn()} />);
    expect(screen.getByTestId('toast')).toHaveClass('toast--info');
  });

  it('renders error variant', () => {
    render(<Toast message="Error" variant="error" onClose={jest.fn()} />);
    expect(screen.getByTestId('toast')).toHaveClass('toast--error');
  });

  it('renders success variant', () => {
    render(<Toast message="Done" variant="success" onClose={jest.fn()} />);
    expect(screen.getByTestId('toast')).toHaveClass('toast--success');
  });

  it('renders warning variant', () => {
    render(<Toast message="Watch out" variant="warning" onClose={jest.fn()} />);
    expect(screen.getByTestId('toast')).toHaveClass('toast--warning');
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(<Toast message="Close me" onClose={onClose} />);
    fireEvent.click(screen.getByTestId('toast-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after the default 5000 ms', () => {
    const onClose = jest.fn();
    render(<Toast message="Auto" onClose={onClose} duration={5000} />);
    expect(onClose).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(5000); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after a custom duration', () => {
    const onClose = jest.fn();
    render(<Toast message="Quick" onClose={onClose} duration={2000} />);
    act(() => { jest.advanceTimersByTime(1999); });
    expect(onClose).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(1); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT auto-dismiss when duration is 0', () => {
    const onClose = jest.fn();
    render(<Toast message="Sticky" onClose={onClose} duration={0} />);
    act(() => { jest.advanceTimersByTime(60000); });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses a custom dataTestId', () => {
    render(<Toast message="Custom id" onClose={jest.fn()} dataTestId="my-toast" />);
    expect(screen.getByTestId('my-toast')).toBeInTheDocument();
    expect(screen.getByTestId('my-toast-message')).toHaveTextContent('Custom id');
    expect(screen.getByTestId('my-toast-close')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<Toast message="Alert" onClose={jest.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('clears the timer on unmount to avoid memory leaks', () => {
    const onClose = jest.fn();
    const { unmount } = render(<Toast message="Unmount" onClose={onClose} duration={3000} />);
    unmount();
    act(() => { jest.advanceTimersByTime(3000); });
    expect(onClose).not.toHaveBeenCalled();
  });
});
