import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FinancialReportsPage, {
  buildReportRows,
  exportToCSV,
  isConfirmed,
  isCancelled,
  isPaidStatus,
  isInMonth,
  MONTHS_FULL,
} from '@/pages/b2b/FinancialReportsPage/FinancialReportsPage';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/AuthContext',     () => ({ useAuth:     jest.fn() }));
jest.mock('@/context/CurrencyContext', () => ({ useCurrency: jest.fn() }));

jest.mock('@/services/booking.service', () => ({
  bookingService: {
    getHotelBookings: jest.fn(),
    getMyBookings:    jest.fn(),
  },
  getHotelIdFromToken: jest.fn(),
}));

import { bookingService, getHotelIdFromToken } from '@/services/booking.service';

const mockUseAuth             = useAuth             as jest.MockedFunction<typeof useAuth>;
const mockUseCurrency         = useCurrency         as jest.MockedFunction<typeof useCurrency>;
const mockGetHotelBookings    = bookingService.getHotelBookings  as jest.Mock;
const mockGetMyBookings       = bookingService.getMyBookings      as jest.Mock;
const mockGetHotelIdFromToken = getHotelIdFromToken               as jest.Mock;
const mockLogout              = jest.fn();

// ── Shared test data ──────────────────────────────────────────────────────────

// Current date in context: 2026-05-16 → month=4 (May, 0-indexed), year=2026
const YEAR  = 2026;
const MONTH = 4; // May

const mockBookings = [
  {
    id: 'b1',
    codigo: 'RES-001',
    viajeroId: 'v1',
    nombreUser: 'John Doe',
    habitacionId: 'r1',
    nombreHabitacion: 'Suite 101',
    fechaCheckIn:  '2026-05-10T14:00:00',
    fechaCheckOut: '2026-05-15T12:00:00',
    numHuespedes: 2,
    estado: 'pagado',
    subtotal: 500,
    impuestos: 90,
    total: 590,
    moneda: 'USD',
  },
  {
    id: 'b2',
    codigo: 'RES-002',
    viajeroId: 'v2',
    nombreUser: 'Jane Smith',
    habitacionId: 'r2',
    nombreHabitacion: 'Standard 201',
    fechaCheckIn:  '2026-05-20T14:00:00',
    fechaCheckOut: '2026-05-22T12:00:00',
    numHuespedes: 1,
    estado: 'confirmado',
    subtotal: 200,
    impuestos: 36,
    total: 236,
    moneda: 'USD',
  },
  {
    id: 'b3',
    codigo: 'RES-003',
    viajeroId: 'v3',
    nombreUser: 'Bob Wilson',
    habitacionId: 'r1',
    nombreHabitacion: 'Suite 101',
    fechaCheckIn:  '2026-05-25T14:00:00',
    fechaCheckOut: '2026-05-28T12:00:00',
    numHuespedes: 2,
    estado: 'pendiente', // ← excluded from report
    subtotal: 300,
    impuestos: 54,
    total: 354,
    moneda: 'USD',
  },
  {
    id: 'b4',
    codigo: 'RES-004',
    viajeroId: 'v4',
    nombreUser: 'Alice Brown',
    habitacionId: 'r2',
    nombreHabitacion: 'Standard 201',
    fechaCheckIn:  '2026-04-15T14:00:00', // ← April, different month
    fechaCheckOut: '2026-04-18T12:00:00',
    numHuespedes: 1,
    estado: 'pagado',
    subtotal: 400,
    impuestos: 72,
    total: 472,
    moneda: 'USD',
  },
  {
    id: 'b5',
    codigo: 'RES-005',
    viajeroId: 'v5',
    nombreUser: 'Carlos Ruiz',
    habitacionId: 'r1',
    nombreHabitacion: 'Suite 101',
    fechaCheckIn:  '2026-05-12T14:00:00',
    fechaCheckOut: '2026-05-14T12:00:00',
    numHuespedes: 2,
    estado: 'cancelado', // ← excluded
    subtotal: 180,
    impuestos: 32,
    total: 212,
    moneda: 'USD',
  },
];
// May confirmed/paid: b1 (590, taxes 90) + b2 (236, taxes 36) → gross=826, taxes=126, net=700

const renderPage = () =>
  render(
    <MemoryRouter>
      <FinancialReportsPage />
    </MemoryRouter>,
  );

// ── Setup ─────────────────────────────────────────────────────────────────────

describe('FinancialReportsPage', () => {
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
    mockUseCurrency.mockReturnValue({
      currency: 'USD',
      setCurrency: jest.fn(),
      supportedCurrencies: ['USD', 'EUR', 'COP'],
    });
    mockGetHotelIdFromToken.mockReturnValue('hotel-123');
    mockGetHotelBookings.mockResolvedValue(mockBookings);
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders page container', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-page')).toBeInTheDocument();
  });

  it('renders the B2B header', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-header')).toBeInTheDocument();
  });

  it('renders the B2B sidebar', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-sidebar')).toBeInTheDocument();
  });

  it('renders the Financial Reports title', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /b2b\.financial\.title/i })).toBeInTheDocument();
  });

  // ── Month / year selectors ─────────────────────────────────────────────────

  it('renders the month selector', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-month-select')).toBeInTheDocument();
  });

  it('renders the year selector', () => {
    renderPage();
    expect(screen.getByTestId('financial-reports-year-select')).toBeInTheDocument();
  });

  it('month selector defaults to current month (May = 4)', () => {
    renderPage();
    const select = screen.getByTestId('financial-reports-month-select') as HTMLSelectElement;
    expect(Number(select.value)).toBe(MONTH);
  });

  it('year selector defaults to current year', () => {
    renderPage();
    const select = screen.getByTestId('financial-reports-year-select') as HTMLSelectElement;
    expect(Number(select.value)).toBe(YEAR);
  });

  it('renders all 12 months in the month selector', () => {
    renderPage();
    const options = screen.getByTestId('financial-reports-month-select').querySelectorAll('option');
    expect(options).toHaveLength(12);
    expect(options[0]!.textContent).toBe('January');
    expect(options[11]!.textContent).toBe('December');
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  it('shows loading placeholder in totals while fetching', () => {
    mockGetHotelBookings.mockReturnValueOnce(new Promise(() => {}));
    renderPage();
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  it('hides loading placeholder after fetch completes', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByText('…')).not.toBeInTheDocument());
  });

  // ── Totals ─────────────────────────────────────────────────────────────────

  it('renders the three totals cards', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('financial-reports-gross')).toBeInTheDocument();
      expect(screen.getByTestId('financial-reports-taxes')).toBeInTheDocument();
      expect(screen.getByTestId('financial-reports-net')).toBeInTheDocument();
    });
  });

  it('gross income equals sum of totals for confirmed/paid bookings in the selected month', async () => {
    renderPage();
    // b1 (pagado): 590 + b2 (confirmado): 236 = 826
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-gross-value')).toHaveTextContent('826'),
    );
  });

  it('taxes equal sum of impuestos for confirmed/paid bookings', async () => {
    renderPage();
    // b1: 90 + b2: 36 = 126
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-taxes-value')).toHaveTextContent('126'),
    );
  });

  it('net income equals gross minus taxes', async () => {
    renderPage();
    // 826 - 126 = 700
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-net-value')).toHaveTextContent('700'),
    );
  });

  it('totals reset to zero when no bookings match the selected month', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-gross-value')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByTestId('financial-reports-month-select'), { target: { value: '0' } }); // January
    await waitFor(() => {
      expect(screen.getByTestId('financial-reports-gross-value')).toHaveTextContent('$0');
      expect(screen.getByTestId('financial-reports-taxes-value')).toHaveTextContent('$0');
      expect(screen.getByTestId('financial-reports-net-value')).toHaveTextContent('$0');
    });
  });

  // ── Transactions table ─────────────────────────────────────────────────────

  it('renders the monthly transactions table', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-report-table')).toBeInTheDocument(),
    );
  });

  it('shows all required column headers', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('b2b.financial.monthly.colDate')).toBeInTheDocument();
      expect(screen.getByText('b2b.financial.monthly.colBookingNumber')).toBeInTheDocument();
      expect(screen.getByText('b2b.financial.monthly.colGuest')).toBeInTheDocument();
      expect(screen.getByText('b2b.financial.monthly.colAmount')).toBeInTheDocument();
      expect(screen.getByText('b2b.financial.monthly.colStatus')).toBeInTheDocument();
      expect(screen.getByText('b2b.financial.monthly.colPaymentMethod')).toBeInTheDocument();
    });
  });

  it('shows only confirmed and paid bookings (excludes pending)', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
  });

  it('excludes cancelled bookings from the report table', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    expect(screen.queryByText('Carlos Ruiz')).not.toBeInTheDocument();
  });

  it('excludes bookings from other months', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    expect(screen.queryByText('Alice Brown')).not.toBeInTheDocument();
  });

  it('shows booking numbers in the table', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('RES-001')).toBeInTheDocument();
      expect(screen.getByText('RES-002')).toBeInTheDocument();
    });
  });

  it('shows report section title with selected month and year', async () => {
    renderPage();
    await waitFor(() => {
      const title = screen.getByTestId('financial-reports-report-title');
      expect(title).toHaveTextContent(`${MONTHS_FULL[MONTH]} ${YEAR}`);
    });
  });

  it('shows empty state when no confirmed bookings in selected month', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-month-select')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByTestId('financial-reports-month-select'), { target: { value: '0' } });
    await waitFor(() =>
      expect(screen.getByText('b2b.financial.monthly.noReportData')).toBeInTheDocument(),
    );
  });

  it('filters report rows when the month selector changes', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());

    // Switch to April → only Alice Brown (b4, pagado)
    fireEvent.change(screen.getByTestId('financial-reports-month-select'), { target: { value: '3' } });
    await waitFor(() => expect(screen.getByText('Alice Brown')).toBeInTheDocument());
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('filters report rows when the year selector changes to a year with no data', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('financial-reports-year-select'), { target: { value: '2025' } });
    await waitFor(() =>
      expect(screen.getByText('b2b.financial.monthly.noReportData')).toBeInTheDocument(),
    );
  });

  // ── CSV export ─────────────────────────────────────────────────────────────

  it('download button is disabled when there are no report rows', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-month-select')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByTestId('financial-reports-month-select'), { target: { value: '0' } });
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-download-btn')).toBeDisabled(),
    );
  });

  it('download button is enabled when there are confirmed bookings in the period', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-download-btn')).not.toBeDisabled(),
    );
  });

  it('triggers a CSV download when the button is clicked', async () => {
    const createObjectURL = jest.fn(() => 'blob:mock-url');
    const revokeObjectURL = jest.fn();
    const origCreate      = URL.createObjectURL;
    const origRevoke      = URL.revokeObjectURL;
    URL.createObjectURL   = createObjectURL;
    URL.revokeObjectURL   = revokeObjectURL;

    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-download-btn')).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByTestId('financial-reports-download-btn'));

    expect(createObjectURL).toHaveBeenCalled();
    const blobArg = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
    expect(blobArg.type).toContain('text/csv');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
  });

  // ── Error state ────────────────────────────────────────────────────────────

  it('shows error message when API call fails', async () => {
    mockGetHotelBookings.mockRejectedValueOnce(new Error('Network error'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-error')).toHaveTextContent('Network error'),
    );
  });

  // ── API calls ──────────────────────────────────────────────────────────────

  it('calls getHotelIdFromToken with the access token', async () => {
    renderPage();
    await waitFor(() =>
      expect(mockGetHotelIdFromToken).toHaveBeenCalledWith('token-abc'),
    );
  });

  it('calls getHotelBookings with hotel id, token and currency', async () => {
    renderPage();
    await waitFor(() =>
      expect(mockGetHotelBookings).toHaveBeenCalledWith('hotel-123', 'token-abc', 'USD'),
    );
  });

  it('falls back to getMyBookings when token has no hotel_id', async () => {
    mockGetHotelIdFromToken.mockReturnValueOnce(null);
    mockGetMyBookings.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() =>
      expect(mockGetMyBookings).toHaveBeenCalledWith('token-abc', { moneda: 'USD' }),
    );
  });

  // ── Secondary sections ─────────────────────────────────────────────────────

  it('renders the income chart', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-income-chart')).toBeInTheDocument(),
    );
  });

  it('renders the room aggregation table', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('financial-reports-table')).toBeInTheDocument(),
    );
  });

  // ── Sidebar ────────────────────────────────────────────────────────────────

  it('calls logout when sidebar logout button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByTestId('b2b-sidebar-logout'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  // ── Unit tests for pure helpers ────────────────────────────────────────────

  describe('buildReportRows', () => {
    it('returns only confirmed/paid bookings in the target month', () => {
      const rows = buildReportRows(mockBookings as never, MONTH, YEAR);
      expect(rows).toHaveLength(2);
      expect(rows.map(r => r.id).sort()).toEqual(['b1', 'b2'].sort());
    });

    it('excludes pendiente bookings', () => {
      const rows = buildReportRows(mockBookings as never, MONTH, YEAR);
      expect(rows.find(r => r.id === 'b3')).toBeUndefined();
    });

    it('excludes cancelado bookings', () => {
      const rows = buildReportRows(mockBookings as never, MONTH, YEAR);
      expect(rows.find(r => r.id === 'b5')).toBeUndefined();
    });

    it('excludes bookings from other months', () => {
      const rows = buildReportRows(mockBookings as never, MONTH, YEAR);
      expect(rows.find(r => r.id === 'b4')).toBeUndefined();
    });

    it('maps all required fields correctly', () => {
      const rows = buildReportRows(mockBookings as never, MONTH, YEAR);
      const b1   = rows.find(r => r.id === 'b1')!;
      expect(b1.bookingNumber).toBe('RES-001');
      expect(b1.guest).toBe('John Doe');
      expect(b1.amount).toBe(590);
      expect(b1.subtotal).toBe(500);
      expect(b1.taxes).toBe(90);
      expect(b1.status).toBe('pagado');
      expect(b1.fecha).toBe('2026-05-10');
    });

    it('returns empty array when no bookings match', () => {
      const rows = buildReportRows(mockBookings as never, 0, YEAR); // January
      expect(rows).toHaveLength(0);
    });

    it('sorts rows by check-in date ascending', () => {
      const rows = buildReportRows(mockBookings as never, MONTH, YEAR);
      expect(rows[0]!.fecha).toBe('2026-05-10');
      expect(rows[1]!.fecha).toBe('2026-05-20');
    });

    it('uses metodoPago when present', () => {
      const withPayment = [{ ...mockBookings[0], metodoPago: 'credit_card' }];
      const rows        = buildReportRows(withPayment as never, MONTH, YEAR);
      expect(rows[0]!.paymentMethod).toBe('credit_card');
    });

    it('falls back to "—" when metodoPago is absent', () => {
      const rows = buildReportRows(mockBookings as never, MONTH, YEAR);
      expect(rows[0]!.paymentMethod).toBe('—');
    });

    it('sum of row amounts equals gross income expectation', () => {
      const rows  = buildReportRows(mockBookings as never, MONTH, YEAR);
      const gross = rows.reduce((s, r) => s + r.amount, 0);
      expect(gross).toBe(826); // 590 + 236
    });

    it('sum of row taxes equals taxes expectation', () => {
      const rows   = buildReportRows(mockBookings as never, MONTH, YEAR);
      const taxes  = rows.reduce((s, r) => s + r.taxes, 0);
      expect(taxes).toBe(126); // 90 + 36
    });
  });

  describe('exportToCSV', () => {
    let origCreate: typeof URL.createObjectURL;
    let origRevoke: typeof URL.revokeObjectURL;
    let createObjectURL: jest.Mock;
    let revokeObjectURL: jest.Mock;

    beforeEach(() => {
      origCreate        = URL.createObjectURL;
      origRevoke        = URL.revokeObjectURL;
      createObjectURL   = jest.fn(() => 'blob:url');
      revokeObjectURL   = jest.fn();
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
    });
    afterEach(() => {
      URL.createObjectURL = origCreate;
      URL.revokeObjectURL = origRevoke;
    });

    it('creates a CSV blob and revokes the URL', () => {
      const appendSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(el => el);
      const removeSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(el => el);
      const rows = buildReportRows(mockBookings as never, MONTH, YEAR);
      exportToCSV(rows, { gross: 826, taxes: 126, net: 700 }, MONTH, YEAR);
      const blobArg = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
      expect(blobArg.type).toContain('text/csv');
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:url');
      appendSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it('names the file with year and zero-padded month', () => {
      const appendSpy  = jest.spyOn(document.body, 'appendChild').mockImplementation(el => el);
      const removeSpy  = jest.spyOn(document.body, 'removeChild').mockImplementation(el => el);
      const rows       = buildReportRows(mockBookings as never, MONTH, YEAR);
      exportToCSV(rows, { gross: 826, taxes: 126, net: 700 }, MONTH, YEAR);
      const link = (appendSpy.mock.calls[0] as [HTMLAnchorElement])[0];
      expect(link.download).toBe(`financial-report-${YEAR}-05.csv`);
      appendSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe('helper functions', () => {
    it.each([['pagado'], ['pagada'], ['confirmado'], ['confirmada'], ['activo'], ['active']])(
      'isConfirmed("%s") → true',
      (estado) => expect(isConfirmed(estado)).toBe(true),
    );

    it.each([['pendiente'], ['cancelado'], ['cancelada']])(
      'isConfirmed("%s") → false',
      (estado) => expect(isConfirmed(estado)).toBe(false),
    );

    it.each([['cancelado'], ['cancelada']])(
      'isCancelled("%s") → true',
      (estado) => expect(isCancelled(estado)).toBe(true),
    );

    it('isCancelled("confirmado") → false', () =>
      expect(isCancelled('confirmado')).toBe(false),
    );

    it.each([['pagado'], ['pagada']])(
      'isPaidStatus("%s") → true',
      (estado) => expect(isPaidStatus(estado)).toBe(true),
    );

    it('isPaidStatus("confirmado") → false', () =>
      expect(isPaidStatus('confirmado')).toBe(false),
    );

    it('isInMonth returns true when date matches month and year', () =>
      expect(isInMonth('2026-05-15', 4, 2026)).toBe(true),
    );

    it('isInMonth returns false for wrong month', () =>
      expect(isInMonth('2026-05-15', 3, 2026)).toBe(false),
    );

    it('isInMonth returns false for wrong year', () =>
      expect(isInMonth('2026-05-15', 4, 2025)).toBe(false),
    );
  });
});
