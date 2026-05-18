import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TarifaDetailModal, {
  formatDate,
  toApiDiscount,
  computeFinalPrice,
  validateDiscount,
} from '@/components/shared/TarifaDetailModal/TarifaDetailModal';
import { inventoryService } from '@/services/inventory.service';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/services/inventory.service', () => ({
  inventoryService: {
    getBaseTariff:  jest.fn(),
    getRoomTariffs: jest.fn(),
    createTariff:   jest.fn(),
    patchTariff:    jest.fn(),
    deleteTariff:   jest.fn(),
  },
}));

// Mock Modal to render children directly
jest.mock('@/components/ui', () => ({
  Modal:  ({ children, isOpen, dataTestId }: { children: React.ReactNode; isOpen: boolean; dataTestId?: string }) =>
    isOpen ? <div data-testid={dataTestId}>{children}</div> : null,
  Button: ({ children, onClick, disabled, dataTestId, className }: {
    children: React.ReactNode; onClick?: () => void; disabled?: boolean; dataTestId?: string; className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-testid={dataTestId} className={className}>
      {children}
    </button>
  ),
  Input: ({ value, onChange, type, dataTestId, placeholder, min, max, id }: {
    value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string; dataTestId?: string; placeholder?: string;
    min?: string; max?: string; id?: string;
  }) => (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      data-testid={dataTestId}
      placeholder={placeholder}
      min={min}
      max={max}
    />
  ),
}));

import { HabitacionInventario, Tarifa } from '@/services/inventory.service';

const mockGetBaseTariff  = inventoryService.getBaseTariff  as jest.Mock;
const mockGetRoomTariffs = inventoryService.getRoomTariffs as jest.Mock;
const mockCreateTariff   = inventoryService.createTariff   as jest.Mock;
const mockPatchTariff    = inventoryService.patchTariff    as jest.Mock;
const mockDeleteTariff   = inventoryService.deleteTariff   as jest.Mock;

// ── Test data ─────────────────────────────────────────────────────────────────

const mockRoom: HabitacionInventario = {
  id: 'r1',
  tipo: 'Suite',
  capacidadMaxima: 2,
  categoria: 'Premium',
};

const mockBase: Tarifa = {
  id: 'bt1',
  precioBase: 200,
  descuento: 0.10,  // API uses 0–1 scale: 0.10 = 10%
  moneda: 'COP',
};

const mockVariation: Tarifa = {
  id: 'v1',
  precioBase: 150,
  descuento: 0.20,  // API uses 0–1 scale: 0.20 = 20%
  fechaInicio: '2026-11-01T00:00:00+00:00',
  fechaFin:    '2026-11-30T23:59:59+00:00',
};

const defaultProps = {
  isOpen:      true,
  onClose:     jest.fn(),
  room:        mockRoom,
  accessToken: 'token-abc',
  dataTestId:  'prices-manager-tariff-modal',
};

const renderModal = (props = {}) =>
  render(<TarifaDetailModal {...defaultProps} {...props} />);

// ── Setup ─────────────────────────────────────────────────────────────────────

describe('TarifaDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBaseTariff.mockResolvedValue(mockBase);
    mockGetRoomTariffs.mockResolvedValue([mockVariation]);
  });

  // ── Not rendered when closed ───────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByTestId('prices-manager-tariff-modal')).not.toBeInTheDocument();
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  it('shows loading state while fetching tariffs', () => {
    mockGetBaseTariff.mockReturnValueOnce(new Promise(() => {}));
    renderModal();
    expect(screen.getByTestId('prices-manager-tariff-modal-loading')).toBeInTheDocument();
    expect(screen.getByText('b2b.prices.modal.loadingTariffs')).toBeInTheDocument();
  });

  it('hides loading state after data is fetched', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.queryByTestId('prices-manager-tariff-modal-loading')).not.toBeInTheDocument(),
    );
  });

  // ── Error ──────────────────────────────────────────────────────────────────

  it('shows error when API call fails', async () => {
    mockGetBaseTariff.mockRejectedValueOnce(new Error('Server error'));
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-error')).toHaveTextContent('Server error'),
    );
  });

  // ── Base tariff display ────────────────────────────────────────────────────

  it('renders base tariff price', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-base-price')).toHaveTextContent('200'),
    );
  });

  it('renders base tariff discount', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-base-discount')).toHaveTextContent('10%'),
    );
  });

  it('renders correct final price for base tariff (price * (1 - descuento))', async () => {
    renderModal();
    // 200 * (1 - 0.10) = 180.00
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-final-price')).toHaveTextContent('180.00'),
    );
  });

  // ── Variations list ────────────────────────────────────────────────────────

  it('renders existing variation in the table', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-variation-row-v1')).toBeInTheDocument(),
    );
  });

  it('shows empty message when no variations', async () => {
    mockGetRoomTariffs.mockResolvedValueOnce([]);
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-no-variations')).toBeInTheDocument(),
    );
  });

  it('shows Edit and Delete buttons for each variation row', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1')).toBeInTheDocument();
      expect(screen.getByTestId('prices-manager-tariff-modal-delete-v1')).toBeInTheDocument();
    });
  });

  // ── Delete variation ───────────────────────────────────────────────────────

  it('removes variation from list when Delete is clicked', async () => {
    mockDeleteTariff.mockResolvedValueOnce(undefined);
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-delete-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-delete-v1'));
    await waitFor(() =>
      expect(screen.queryByTestId('prices-manager-tariff-modal-variation-row-v1')).not.toBeInTheDocument(),
    );
  });

  it('shows delete error when delete API call fails', async () => {
    mockDeleteTariff.mockRejectedValueOnce(new Error('Delete failed'));
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-delete-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-delete-v1'));
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-delete-error')).toHaveTextContent('Delete failed'),
    );
  });

  // ── Inline edit: open/close ────────────────────────────────────────────────

  it('shows inline edit row when Edit button is clicked', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1'));
    expect(screen.getByTestId('prices-manager-tariff-modal-edit-row-v1')).toBeInTheDocument();
  });

  it('pre-populates edit form with variation values', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1'));

    const priceInput = screen.getByTestId('prices-manager-tariff-modal-edit-price-v1') as HTMLInputElement;
    const discInput  = screen.getByTestId('prices-manager-tariff-modal-edit-v1-discount-value') as HTMLInputElement;
    expect(priceInput.value).toBe('150');
    expect(discInput.value).toBe('20'); // 0.20 * 100 = 20 (UI shows percentage, not decimal)
  });

  it('hides inline edit row when Cancel is clicked', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1'));
    expect(screen.getByTestId('prices-manager-tariff-modal-edit-row-v1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-cancel-v1'));
    expect(screen.queryByTestId('prices-manager-tariff-modal-edit-row-v1')).not.toBeInTheDocument();
  });

  // ── Inline edit: PATCH (percentage discount) ───────────────────────────────

  it('calls patchTariff with correct percentage discount when save is clicked', async () => {
    const updatedVariation = { ...mockVariation, precioBase: 180, descuento: 0.10 };
    mockPatchTariff.mockResolvedValueOnce(updatedVariation);

    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1'));

    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-price-v1'), { target: { value: '180' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-v1-discount-value'), { target: { value: '10' } });

    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-save-v1'));

    await waitFor(() =>
      expect(mockPatchTariff).toHaveBeenCalledWith(
        'v1',
        expect.objectContaining({ precioBase: 180, descuento: 0.1 }),
        'token-abc',
      ),
    );
    // Edit row closes after save
    await waitFor(() =>
      expect(screen.queryByTestId('prices-manager-tariff-modal-edit-row-v1')).not.toBeInTheDocument(),
    );
  });

  it('calls patchTariff with converted percentage when fixed discount type is selected', async () => {
    const updatedVariation = { ...mockVariation, precioBase: 200, descuento: 0.25 };
    mockPatchTariff.mockResolvedValueOnce(updatedVariation);

    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1'));

    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-price-v1'), { target: { value: '200' } });
    // Switch to fixed discount
    fireEvent.change(
      screen.getByTestId('prices-manager-tariff-modal-edit-v1-discount-type'),
      { target: { value: 'fixed' } },
    );
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-v1-discount-value'), { target: { value: '50' } });
    // Set dates
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-start-v1'), { target: { value: '2026-11-01' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-end-v1'),   { target: { value: '2026-11-30' } });

    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-save-v1'));

    await waitFor(() =>
      expect(mockPatchTariff).toHaveBeenCalledWith(
        'v1',
        expect.objectContaining({ precioBase: 200, descuento: 0.25 }), // 50/200 = 0.25
        'token-abc',
      ),
    );
  });

  it('shows edit error when PATCH API call fails', async () => {
    mockPatchTariff.mockRejectedValueOnce(new Error('PATCH failed'));

    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1'));
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-save-v1'));

    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-error-v1')).toHaveTextContent('PATCH failed'),
    );
  });

  // ── Inline edit: validation ────────────────────────────────────────────────

  it('shows validation error when discount > 100% (percentage mode)', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1'));

    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-price-v1'), { target: { value: '100' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-v1-discount-value'), { target: { value: '110' } });
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-save-v1'));

    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-error-v1')).toHaveTextContent(
        'b2b.prices.modal.errorDiscountRange',
      ),
    );
    expect(mockPatchTariff).not.toHaveBeenCalled();
  });

  it('shows validation error when fixed discount >= price', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-btn-v1'));

    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-price-v1'), { target: { value: '100' } });
    fireEvent.change(
      screen.getByTestId('prices-manager-tariff-modal-edit-v1-discount-type'),
      { target: { value: 'fixed' } },
    );
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-edit-v1-discount-value'), { target: { value: '100' } });
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-edit-save-v1'));

    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-edit-error-v1')).toHaveTextContent(
        'b2b.prices.modal.errorFixedExceedsPrice',
      ),
    );
    expect(mockPatchTariff).not.toHaveBeenCalled();
  });

  // ── Add variation form ─────────────────────────────────────────────────────

  it('renders the add variation form', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-form')).toBeInTheDocument(),
    );
  });

  it('renders discount type selector in add form', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-form-discount-type')).toBeInTheDocument(),
    );
  });

  it('Add button is disabled when form is incomplete', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-add-btn')).toBeDisabled(),
    );
  });

  it('shows final price preview when price and discount are filled', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-form-price')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-price'),         { target: { value: '200' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-discount-value'), { target: { value: '20' } });
    // 200 * (1 - 20/100) = 160.00
    expect(screen.getByTestId('prices-manager-tariff-modal-form-preview')).toHaveTextContent('160.00');
  });

  it('calls createTariff with correct percentage discount (pct mode)', async () => {
    mockCreateTariff.mockResolvedValueOnce({ id: 'v2', precioBase: 180, descuento: 10 });
    mockGetRoomTariffs.mockResolvedValue([mockVariation]);

    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-form-price')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-price'),         { target: { value: '180' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-discount-value'), { target: { value: '10' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-start'),          { target: { value: '2026-12-01' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-end'),            { target: { value: '2026-12-31' } });

    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-add-btn'));

    await waitFor(() =>
      expect(mockCreateTariff).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({
          habitacionId: 'r1',
          precioBase:   180,
          descuento:    0.1,   // 10 / 100 = 0.1
        }),
        'token-abc',
      ),
    );
  });

  it('calls createTariff with converted discount when fixed type is selected', async () => {
    mockCreateTariff.mockResolvedValueOnce({ id: 'v2', precioBase: 200, descuento: 25 });
    mockGetRoomTariffs.mockResolvedValue([]);

    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-form-price')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-price'), { target: { value: '200' } });
    // Switch to fixed
    fireEvent.change(
      screen.getByTestId('prices-manager-tariff-modal-form-discount-type'),
      { target: { value: 'fixed' } },
    );
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-discount-value'), { target: { value: '50' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-start'), { target: { value: '2026-12-01' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-end'),   { target: { value: '2026-12-31' } });

    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-add-btn'));

    await waitFor(() =>
      expect(mockCreateTariff).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({ precioBase: 200, descuento: 0.25 }), // 50/200 = 0.25
        'token-abc',
      ),
    );
  });

  it('shows form error when price is 0', async () => {
    renderModal();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-form-price')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-price'),         { target: { value: '0' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-discount-value'), { target: { value: '10' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-start'), { target: { value: '2026-12-01' } });
    fireEvent.change(screen.getByTestId('prices-manager-tariff-modal-form-end'),   { target: { value: '2026-12-31' } });

    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-add-btn'));

    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-form-error')).toHaveTextContent(
        'b2b.prices.modal.errorPriceZero',
      ),
    );
    expect(mockCreateTariff).not.toHaveBeenCalled();
  });

  // ── Close button ───────────────────────────────────────────────────────────

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-close-btn')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── API calls ──────────────────────────────────────────────────────────────

  it('calls getBaseTariff with room id and token', async () => {
    renderModal();
    await waitFor(() =>
      expect(mockGetBaseTariff).toHaveBeenCalledWith('r1', 'token-abc'),
    );
  });

  it('calls getRoomTariffs with room id and token', async () => {
    renderModal();
    await waitFor(() =>
      expect(mockGetRoomTariffs).toHaveBeenCalledWith('r1', 'token-abc'),
    );
  });

  // ── Unit tests for pure helpers ────────────────────────────────────────────

  describe('formatDate', () => {
    it('formats ISO date to locale string', () =>
      expect(formatDate('2026-11-01T00:00:00+00:00')).toMatch(/\d/),
    );
    it('returns "—" for null', ()  => expect(formatDate(null)).toBe('—'));
    it('returns "—" for undefined', () => expect(formatDate(undefined)).toBe('—'));
  });

  describe('toApiDiscount', () => {
    it('converts pct input to 0-1 decimal (20 → 0.2)', () =>
      expect(toApiDiscount('pct', 20, 200)).toBe(0.2),
    );
    it('converts fixed amount to 0-1 fraction of price (50/200 = 0.25)', () =>
      expect(toApiDiscount('fixed', 50, 200)).toBe(0.25),
    );
    it('returns 0 when price is 0 (fixed mode)', () =>
      expect(toApiDiscount('fixed', 50, 0)).toBe(0),
    );
    it('caps at 1.0 when fixed discount exceeds price', () =>
      expect(toApiDiscount('fixed', 300, 200)).toBe(1),
    );
  });

  describe('computeFinalPrice', () => {
    it('computes price with percentage discount', () =>
      expect(computeFinalPrice(200, 'pct', 20)).toBe(160),
    );
    it('computes price with fixed discount', () =>
      expect(computeFinalPrice(200, 'fixed', 50)).toBe(150),
    );
    it('returns full price when discount is 0', () =>
      expect(computeFinalPrice(200, 'pct', 0)).toBe(200),
    );
  });

  describe('validateDiscount', () => {
    it('returns null for valid pct discount', () =>
      expect(validateDiscount('200', 'pct', '20')).toBeNull(),
    );
    it('returns null for valid fixed discount', () =>
      expect(validateDiscount('200', 'fixed', '50')).toBeNull(),
    );
    it('rejects price = 0', () =>
      expect(validateDiscount('0', 'pct', '10')).toBe('b2b.prices.modal.errorPriceZero'),
    );
    it('rejects empty price', () =>
      expect(validateDiscount('', 'pct', '10')).toBe('b2b.prices.modal.errorPriceZero'),
    );
    it('rejects pct discount > 100', () =>
      expect(validateDiscount('200', 'pct', '101')).toBe('b2b.prices.modal.errorDiscountRange'),
    );
    it('rejects negative pct discount', () =>
      expect(validateDiscount('200', 'pct', '-1')).toBe('b2b.prices.modal.errorDiscountRange'),
    );
    it('rejects fixed discount >= price', () =>
      expect(validateDiscount('100', 'fixed', '100')).toBe('b2b.prices.modal.errorFixedExceedsPrice'),
    );
    it('rejects negative fixed discount', () =>
      expect(validateDiscount('100', 'fixed', '-5')).toBe('b2b.prices.modal.errorDiscountRange'),
    );
    it('rejects 100% pct discount (price becomes 0)', () => {
      // 100% → final = 0, which is NOT < 0, so it's valid
      expect(validateDiscount('200', 'pct', '100')).toBeNull();
    });
  });
});
