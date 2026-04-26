import { render, screen, fireEvent } from '@testing-library/react';
import PriceConfigModal from '@/components/shared/PriceConfigModal/PriceConfigModal';

describe('PriceConfigModal', () => {
  it('renders when isOpen is true', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('price-config-modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<PriceConfigModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('price-config-modal')).not.toBeInTheDocument();
  });

  it('renders the hotel title', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('price-config-modal-title')).toHaveTextContent(
      'La Perla, Medellín. Colombia',
    );
  });

  it('renders General Configuration section', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('price-config-modal-general-title')).toHaveTextContent(
      'General Configuration',
    );
  });

  it('renders Offer Configuration section', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('price-config-modal-offer-title')).toHaveTextContent(
      'Offer Configuration',
    );
  });

  it('renders price per night input with default value', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    const priceInput = screen.getByTestId('price-config-modal-price-input') as HTMLInputElement;
    expect(priceInput.value).toBe('56');
  });

  it('renders offer percent input with default value', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    const offerInput = screen.getByTestId('price-config-modal-offer-input') as HTMLInputElement;
    expect(offerInput.value).toBe('10');
  });

  it('renders the active toggle', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('price-config-modal-toggle')).toBeInTheDocument();
  });

  it('toggle is active by default', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('price-config-modal-toggle')).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles the active state when toggle is clicked', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    const toggle = screen.getByTestId('price-config-modal-toggle');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('renders date range inputs', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('price-config-modal-start-date')).toBeInTheDocument();
    expect(screen.getByTestId('price-config-modal-end-date')).toBeInTheDocument();
  });

  it('renders the SAVE button', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('price-config-modal-save-btn')).toHaveTextContent('SAVE');
  });

  it('calls onSave with config and calls onClose when SAVE is clicked', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    render(<PriceConfigModal isOpen={true} onClose={onClose} onSave={onSave} />);
    fireEvent.click(screen.getByTestId('price-config-modal-save-btn'));
    expect(onSave).toHaveBeenCalledWith({
      pricePerNight: '56',
      isActive: true,
      offerPercent: '10',
      offerStartDate: '',
      offerEndDate: '',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose without error when onSave is not provided', () => {
    const onClose = jest.fn();
    render(<PriceConfigModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('price-config-modal-save-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates price per night when input changes', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    const priceInput = screen.getByTestId('price-config-modal-price-input') as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: '120' } });
    expect(priceInput.value).toBe('120');
  });

  it('calls onClose when the modal X button is clicked', () => {
    const onClose = jest.fn();
    render(<PriceConfigModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom dataTestId prefix', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} dataTestId="custom-price" />);
    expect(screen.getByTestId('custom-price')).toBeInTheDocument();
    expect(screen.getByTestId('custom-price-save-btn')).toBeInTheDocument();
  });

  it('updates offer percent when input changes', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    const offerInput = screen.getByTestId('price-config-modal-offer-input') as HTMLInputElement;
    fireEvent.change(offerInput, { target: { value: '25' } });
    expect(offerInput.value).toBe('25');
  });

  it('updates offer start date when input changes', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    const startInput = screen.getByTestId('price-config-modal-start-date') as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: '2026-07-01' } });
    expect(startInput.value).toBe('2026-07-01');
  });

  it('updates offer end date when input changes', () => {
    render(<PriceConfigModal isOpen={true} onClose={jest.fn()} />);
    const endInput = screen.getByTestId('price-config-modal-end-date') as HTMLInputElement;
    fireEvent.change(endInput, { target: { value: '2026-07-31' } });
    expect(endInput.value).toBe('2026-07-31');
  });
});
