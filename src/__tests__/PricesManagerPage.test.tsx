import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PricesManagerPage from '@/pages/b2b/PricesManagerPage/PricesManagerPage';
import { useAuth } from '@/context/AuthContext';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));

jest.mock('@/services/inventory.service', () => ({
  inventoryService: {
    getHotelRooms: jest.fn(),
    getBaseTariff: jest.fn(),
    getRoomTariffs: jest.fn(),
    createTariff: jest.fn(),
    deleteTariff: jest.fn(),
  },
}));

jest.mock('@/services/booking.service', () => ({
  getHotelIdFromToken: jest.fn(),
}));

import { inventoryService } from '@/services/inventory.service';
import { getHotelIdFromToken } from '@/services/booking.service';
import { HabitacionInventario } from '@/services/inventory.service';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetHotelRooms    = inventoryService.getHotelRooms as jest.Mock;
const mockGetHotelIdFromToken = getHotelIdFromToken as jest.Mock;
const mockGetBaseTariff    = inventoryService.getBaseTariff as jest.Mock;
const mockGetRoomTariffs   = inventoryService.getRoomTariffs as jest.Mock;
const mockCreateTariff     = inventoryService.createTariff as jest.Mock;
const mockLogout = jest.fn();

const mockRooms: HabitacionInventario[] = [
  { id: 'r1', tipo: 'Suite',    capacidadMaxima: 2, categoria: 'Premium' },
  { id: 'r2', tipo: 'Standard', capacidadMaxima: 2, categoria: 'Economy' },
];

const mockBaseTariff = { id: 'bt1', precioBase: 150, descuento: 10, moneda: 'COP' };
const mockVariations = [
  {
    id: 'v1', precioBase: 120, descuento: 20,
    fechaInicio: '2026-11-01T00:00:00+00:00',
    fechaFin:    '2026-11-30T23:59:59+00:00',
  },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/business/prices-manager']}>
      <PricesManagerPage />
    </MemoryRouter>,
  );

describe('PricesManagerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'u1',
        email: 'admin@hotel.com',
        username: 'admin',
        nombre: 'Admin Hotel',
        rol: 'hotel_admin',
        telefono: null,
        pais: 'CO',
        idioma: 'es',
        moneda_preferida: 'USD',
      },
      accessToken: 'token-abc',
      login: jest.fn(),
      logout: mockLogout,
    });
    mockGetHotelIdFromToken.mockReturnValue('hotel-123');
    mockGetHotelRooms.mockResolvedValue(mockRooms);
    mockGetBaseTariff.mockResolvedValue(mockBaseTariff);
    mockGetRoomTariffs.mockResolvedValue(mockVariations);
    mockCreateTariff.mockResolvedValue(mockBaseTariff);
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the page container', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-page')).toBeInTheDocument();
  });

  it('renders the B2B header', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-header')).toBeInTheDocument();
    expect(screen.getByText('Travelhub/Prices Manager')).toBeInTheDocument();
  });

  it('renders the B2B sidebar', () => {
    renderPage();
    expect(screen.getByTestId('prices-manager-sidebar')).toBeInTheDocument();
  });

  it('renders the Prices Manager title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /b2b\.prices\.title/i })).toBeInTheDocument();
  });

  it('renders the rooms table subtitle', () => {
    renderPage();
    expect(screen.getByText('b2b.prices.bookingPlacesTable')).toBeInTheDocument();
  });

  // ── Loading state ─────────────────────────────────────────────────────────

  it('shows loading state while fetching rooms', () => {
    mockGetHotelRooms.mockReturnValueOnce(new Promise(() => {}));
    renderPage();
    expect(screen.getByTestId('prices-manager-loading')).toBeInTheDocument();
    expect(screen.getByText('b2b.prices.loading')).toBeInTheDocument();
  });

  it('hides loading state after data is fetched', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.queryByTestId('prices-manager-loading')).not.toBeInTheDocument(),
    );
  });

  // ── Success state ─────────────────────────────────────────────────────────

  it('renders the data table when rooms are loaded', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-table')).toBeInTheDocument(),
    );
  });

  it('renders table column headers', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('b2b.prices.colPlace')).toBeInTheDocument();
      expect(screen.getByText('b2b.prices.colType')).toBeInTheDocument();
      expect(screen.getByText('b2b.prices.colCapacity')).toBeInTheDocument();
      expect(screen.getByText('b2b.prices.colPayoutStatus')).toBeInTheDocument();
      expect(screen.getByText('b2b.prices.colBasePrice')).toBeInTheDocument();
      expect(screen.getByText('b2b.prices.colConfig')).toBeInTheDocument();
    });
  });

  it('renders room IDs in the table', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('r1')).toBeInTheDocument();
      expect(screen.getByText('r2')).toBeInTheDocument();
    });
  });

  // ── Base price column ─────────────────────────────────────────────────────

  it('renders the base price for each room', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('prices-manager-base-price-r1')).toBeInTheDocument();
      expect(screen.getByTestId('prices-manager-base-price-r2')).toBeInTheDocument();
    });
  });

  it('renders the set-price button only for rooms without a base tariff', async () => {
    // r1 has no base tariff; r2 has one
    mockGetBaseTariff
      .mockRejectedValueOnce(new Error('Not found')) // r1 → no tariff
      .mockResolvedValueOnce(mockBaseTariff);        // r2 → has tariff
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('prices-manager-edit-btn-r1')).toBeInTheDocument();
      expect(screen.queryByTestId('prices-manager-edit-btn-r2')).not.toBeInTheDocument();
    });
  });

  it('does not render the set-price button when the room already has a base tariff', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.queryByTestId('prices-manager-edit-btn-r1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('prices-manager-edit-btn-r2')).not.toBeInTheDocument();
    });
  });

  it('shows inline edit form when edit button is clicked', async () => {
    // Room has no base tariff → set-price button is visible
    mockGetBaseTariff.mockRejectedValue(new Error('Not found'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-edit-btn-r1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-edit-btn-r1'));
    expect(screen.getByTestId('prices-manager-inline-edit-r1')).toBeInTheDocument();
    expect(screen.getByTestId('prices-manager-edit-price-r1')).toBeInTheDocument();
    expect(screen.getByTestId('prices-manager-edit-discount-r1')).toBeInTheDocument();
    expect(screen.getByTestId('prices-manager-edit-start-r1')).toBeInTheDocument();
    expect(screen.getByTestId('prices-manager-edit-end-r1')).toBeInTheDocument();
    expect(screen.getByTestId('prices-manager-save-btn-r1')).toBeInTheDocument();
    expect(screen.getByTestId('prices-manager-cancel-btn-r1')).toBeInTheDocument();
  });

  it('hides inline edit form when cancel is clicked', async () => {
    // Room has no base tariff → set-price button is visible
    mockGetBaseTariff.mockRejectedValue(new Error('Not found'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-edit-btn-r1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-edit-btn-r1'));
    fireEvent.click(screen.getByTestId('prices-manager-cancel-btn-r1'));
    expect(screen.queryByTestId('prices-manager-inline-edit-r1')).not.toBeInTheDocument();
  });

  it('calls createTariff and updates table from response when save is clicked', async () => {
    const updatedTariff = { id: 'bt1', precioBase: 200, descuento: 0, moneda: 'COP',
      fechaInicio: '2026-11-01T00:00:00+00:00', fechaFin: '2026-11-30T23:59:59+00:00' };
    // Room has no base tariff → set-price button is visible
    mockGetBaseTariff.mockRejectedValue(new Error('Not found'));
    mockCreateTariff.mockResolvedValueOnce(updatedTariff);

    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-edit-btn-r1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-edit-btn-r1'));

    fireEvent.change(screen.getByTestId('prices-manager-edit-price-r1'),  { target: { value: '200' } });
    fireEvent.change(screen.getByTestId('prices-manager-edit-start-r1'), { target: { value: '2026-11-01' } });
    fireEvent.change(screen.getByTestId('prices-manager-edit-end-r1'),   { target: { value: '2026-11-30' } });

    fireEvent.click(screen.getByTestId('prices-manager-save-btn-r1'));

    await waitFor(() =>
      expect(mockCreateTariff).toHaveBeenCalledWith(
        'r1',
        {
          habitacionId: 'r1',
          precioBase: 200,
          descuento: 0,
          fechaInicio: '2026-11-01T00:00:00+00:00',
          fechaFin:    '2026-11-30T23:59:59+00:00',
        },
        'token-abc',
      ),
    );
    // Table updates from POST response — no extra getBaseTariff call needed
    await waitFor(() =>
      expect(screen.queryByTestId('prices-manager-inline-edit-r1')).not.toBeInTheDocument(),
    );
  });

  it('save button is disabled until price and both dates are filled', async () => {
    // Room has no base tariff → set-price button is visible
    mockGetBaseTariff.mockRejectedValue(new Error('Not found'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-edit-btn-r1')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-edit-btn-r1'));

    const saveBtn = screen.getByTestId('prices-manager-save-btn-r1');

    // Fill price but leave dates empty → still disabled
    fireEvent.change(screen.getByTestId('prices-manager-edit-price-r1'), { target: { value: '150' } });
    expect(saveBtn).toBeDisabled();

    // Fill start date — still missing end date
    fireEvent.change(screen.getByTestId('prices-manager-edit-start-r1'), { target: { value: '2026-11-01' } });
    expect(saveBtn).toBeDisabled();

    // Fill end date — now all required fields present
    fireEvent.change(screen.getByTestId('prices-manager-edit-end-r1'), { target: { value: '2026-11-30' } });
    expect(saveBtn).not.toBeDisabled();
  });

  // ── Config button ─────────────────────────────────────────────────────────

  it('renders a config button for each room', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('prices-manager-config-btn-r1')).toBeInTheDocument();
      expect(screen.getByTestId('prices-manager-config-btn-r2')).toBeInTheDocument();
    });
  });

  it('config button is enabled when room has a base tariff', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-config-btn-r1')).not.toBeDisabled(),
    );
  });

  it('config button is disabled when room has no base tariff', async () => {
    mockGetBaseTariff.mockRejectedValue(new Error('Not found'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-config-btn-r1')).toBeDisabled(),
    );
  });

  // ── Error state ───────────────────────────────────────────────────────────

  it('shows error message when API call fails', async () => {
    mockGetHotelRooms.mockRejectedValueOnce(new Error('Network error'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-error')).toHaveTextContent('Network error'),
    );
  });

  it('shows noToken error when token has no hotel_id', async () => {
    mockGetHotelIdFromToken.mockReturnValueOnce(null);
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-error')).toHaveTextContent(
        'b2b.prices.noToken',
      ),
    );
  });

  it('does not show table when there is an error', async () => {
    mockGetHotelRooms.mockRejectedValueOnce(new Error('fail'));
    renderPage();
    await waitFor(() => expect(screen.getByTestId('prices-manager-error')).toBeInTheDocument());
    expect(screen.queryByTestId('prices-manager-table')).not.toBeInTheDocument();
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  it('shows empty state when no rooms are returned', async () => {
    mockGetHotelRooms.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-empty')).toHaveTextContent(
        'b2b.prices.noRooms',
      ),
    );
  });

  // ── Modal interaction ─────────────────────────────────────────────────────

  it('opens the tariff detail modal when config button is clicked', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-config-btn-r1')).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-config-btn-r1'));
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal')).toBeInTheDocument(),
    );
  });

  it('closes the tariff detail modal when close button is clicked', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-config-btn-r1')).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-config-btn-r1'));
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-close-btn')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-close-btn'));
    await waitFor(() =>
      expect(screen.queryByTestId('prices-manager-tariff-modal')).not.toBeInTheDocument(),
    );
  });

  it('refreshes the base tariff for the room when modal is closed', async () => {
    const refreshedTariff = { id: 'bt1', precioBase: 999, descuento: 5, moneda: 'COP' };
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-config-btn-r1')).not.toBeDisabled(),
    );
    // Reset call count so we can detect the refresh call specifically
    mockGetBaseTariff.mockClear();
    mockGetBaseTariff.mockResolvedValue(refreshedTariff);

    fireEvent.click(screen.getByTestId('prices-manager-config-btn-r1'));
    await waitFor(() =>
      expect(screen.getByTestId('prices-manager-tariff-modal-close-btn')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId('prices-manager-tariff-modal-close-btn'));

    await waitFor(() =>
      expect(mockGetBaseTariff).toHaveBeenCalledWith('r1', 'token-abc'),
    );
  });

  // ── API calls ─────────────────────────────────────────────────────────────

  it('calls getHotelIdFromToken with the access token', async () => {
    renderPage();
    await waitFor(() => expect(mockGetHotelIdFromToken).toHaveBeenCalledWith('token-abc'));
  });

  it('calls getHotelRooms with the hotel id and access token', async () => {
    renderPage();
    await waitFor(() =>
      expect(mockGetHotelRooms).toHaveBeenCalledWith('hotel-123', 'token-abc'),
    );
  });

  it('calls getBaseTariff for each room after rooms are loaded', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockGetBaseTariff).toHaveBeenCalledWith('r1', 'token-abc');
      expect(mockGetBaseTariff).toHaveBeenCalledWith('r2', 'token-abc');
    });
  });

  // ── Sidebar / logout ──────────────────────────────────────────────────────

  it('logout button is clickable without throwing', () => {
    renderPage();
    expect(() => fireEvent.click(screen.getByTestId('b2b-sidebar-logout'))).not.toThrow();
  });

  it('calls logout from AuthContext when logout button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('b2b-sidebar-logout'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
