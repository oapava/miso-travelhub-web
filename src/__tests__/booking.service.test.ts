import {
  bookingService,
  ReviewHotel,
  BookingResponse,
  ReviewResponse,
  HotelBooking,
  decodeJwtPayload,
  getHotelIdFromToken,
} from '@/services/booking.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockReviews: ReviewHotel[] = [
  {
    id: '66666666-6666-6666-6666-000000000001',
    viajeroId: '77777777-7777-7777-7777-000000000001',
    calificacion: 4,
    comentario: 'Buena',
    fecha: '2024-04-01T00:00:00',
    verificada: true,
  },
  {
    id: '66666666-6666-6666-6666-000000000002',
    viajeroId: '77777777-7777-7777-7777-000000000001',
    calificacion: 3,
    comentario: 'Regular',
    fecha: '2024-04-02T00:00:00',
    verificada: false,
  },
];

const mockBookingResponse: BookingResponse = {
  id: '86d9c688-9687-439c-b76e-8257b16b55ba',
  codigo: 'Codigo123',
  viajeroId: '44444444-4444-4444-4444-000000000001',
  habitacionId: '22222222-2222-2222-2222-000000000001',
  fechaCheckIn: '2026-09-03T00:00:00',
  fechaCheckOut: '2026-09-12T00:00:00',
  numHuespedes: 2,
  estado: 'PENDIENTE',
  subtotal: 810.0,
  impuestos: 162.0,
  total: 972.0,
  moneda: 'EUR',
};

function makeOkResponse(data: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response;
}

function makeErrorResponse(status: number, detail: string | object) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ detail }),
  } as unknown as Response;
}

describe('bookingService.getHotelReviews', () => {
  beforeEach(() => mockFetch.mockReset());

  it('returns reviews array on success', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockReviews));
    const result = await bookingService.getHotelReviews('hotel-123');
    expect(result).toEqual(mockReviews);
  });

  it('calls the correct endpoint with hotelId query param', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockReviews));
    await bookingService.getHotelReviews('hotel-abc');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/booking/reviews_hotel?hotelId=hotel-abc'),
    );
  });

  it('returns empty array when API returns empty list', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse([]));
    const result = await bookingService.getHotelReviews('hotel-123');
    expect(result).toEqual([]);
  });

  it('throws error with detail message on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(404, 'Hotel not found'));
    await expect(bookingService.getHotelReviews('hotel-123')).rejects.toThrow('Hotel not found');
  });

  it('throws error with joined message when detail is an array', async () => {
    const detail = [{ msg: 'field required' }, { msg: 'invalid value' }];
    mockFetch.mockResolvedValueOnce(makeErrorResponse(422, detail));
    await expect(bookingService.getHotelReviews('hotel-123')).rejects.toThrow(
      'field required, invalid value',
    );
  });

  it('throws HTTP status error when detail is not a string or array', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500, { nested: 'error' }));
    await expect(bookingService.getHotelReviews('hotel-123')).rejects.toThrow('HTTP 500');
  });

  it('throws fallback HTTP error when response json fails', async () => {
    const badResponse = {
      ok: false,
      status: 503,
      json: () => Promise.reject(new Error('parse error')),
    } as unknown as Response;
    mockFetch.mockResolvedValueOnce(badResponse);
    await expect(bookingService.getHotelReviews('hotel-123')).rejects.toThrow('HTTP 503');
  });
});

describe('bookingService.bookRoom', () => {
  beforeEach(() => mockFetch.mockReset());

  const bookingRequest = {
    habitacionId: '22222222-2222-2222-2222-000000000001',
    checkin: '2026-09-03T10:00:00',
    checkout: '2026-09-12T10:00:00',
    numHuespedes: 2,
  };

  it('returns booking response on success', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockBookingResponse));
    const result = await bookingService.bookRoom(bookingRequest, 'token123');
    expect(result).toEqual(mockBookingResponse);
  });

  it('calls the correct endpoint with POST method', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockBookingResponse));
    await bookingService.bookRoom(bookingRequest, 'token123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/booking/booking_room'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends Authorization Bearer header', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockBookingResponse));
    await bookingService.bookRoom(bookingRequest, 'mytoken');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer mytoken' }),
      }),
    );
  });

  it('sends Content-Type application/json header', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockBookingResponse));
    await bookingService.bookRoom(bookingRequest, 'token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });

  it('sends request body as JSON', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockBookingResponse));
    await bookingService.bookRoom(bookingRequest, 'token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify(bookingRequest) }),
    );
  });

  it('throws error with detail message on 400 response', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(400, 'Invalid dates'));
    await expect(bookingService.bookRoom(bookingRequest, 'token')).rejects.toThrow('Invalid dates');
  });

  it('throws error with detail message on 401 unauthorized', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(401, 'Unauthorized'));
    await expect(bookingService.bookRoom(bookingRequest, 'bad-token')).rejects.toThrow(
      'Unauthorized',
    );
  });

  it('throws joined message when detail is array of validation errors', async () => {
    const detail = [{ msg: 'checkin required' }, { msg: 'checkout required' }];
    mockFetch.mockResolvedValueOnce(makeErrorResponse(422, detail));
    await expect(bookingService.bookRoom(bookingRequest, 'token')).rejects.toThrow(
      'checkin required, checkout required',
    );
  });

  it('throws HTTP status error when detail is not a string', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500, { code: 'INTERNAL' }));
    await expect(bookingService.bookRoom(bookingRequest, 'token')).rejects.toThrow('HTTP 500');
  });

  it('handles array detail entries without msg field', async () => {
    const detail = [{ other: 'data' }, {}];
    mockFetch.mockResolvedValueOnce(makeErrorResponse(422, detail));
    await expect(bookingService.bookRoom(bookingRequest, 'token')).rejects.toThrow(
      'Validation error, Validation error',
    );
  });
});

describe('bookingService.postReview', () => {
  beforeEach(() => mockFetch.mockReset());

  const reviewRequest = {
    habitacionId: '22222222-2222-2222-2222-000000000001',
    calificacion: 4,
    comentario: 'Great stay!',
  };

  const mockReviewResponse: ReviewResponse = {
    id: 'rev-001',
    viajeroId: 'user-001',
    habitacionId: '22222222-2222-2222-2222-000000000001',
    calificacion: 4,
    comentario: 'Great stay!',
    fecha: '2026-01-01T00:00:00',
    verificada: false,
  };

  it('returns review response on success', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockReviewResponse));
    const result = await bookingService.postReview(reviewRequest, 'token');
    expect(result).toEqual(mockReviewResponse);
  });

  it('calls the correct endpoint with POST method', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockReviewResponse));
    await bookingService.postReview(reviewRequest, 'token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/booking/reviews_hotel'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends Authorization Bearer header', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockReviewResponse));
    await bookingService.postReview(reviewRequest, 'review-token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer review-token' }),
      }),
    );
  });

  it('sends request body as JSON', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockReviewResponse));
    await bookingService.postReview(reviewRequest, 'token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: JSON.stringify(reviewRequest) }),
    );
  });

  it('throws error with detail message on 400 response', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(400, 'Invalid review'));
    await expect(bookingService.postReview(reviewRequest, 'token')).rejects.toThrow(
      'Invalid review',
    );
  });

  it('throws error on 401 unauthorized', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(401, 'Unauthorized'));
    await expect(bookingService.postReview(reviewRequest, 'bad-token')).rejects.toThrow(
      'Unauthorized',
    );
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeJwt(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${encoded}.sig`;
}

describe('decodeJwtPayload', () => {
  it('decodes a valid JWT payload', () => {
    const token = makeJwt({ sub: 'user-1', hotel_id: 'h-42' });
    const payload = decodeJwtPayload(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.hotel_id).toBe('h-42');
  });

  it('returns empty object for a token with fewer than 3 parts', () => {
    expect(decodeJwtPayload('only-one-part')).toEqual({});
  });

  it('returns empty object when payload part is empty', () => {
    expect(decodeJwtPayload('header..sig')).toEqual({});
  });

  it('returns empty object when payload is not valid base64 JSON', () => {
    expect(decodeJwtPayload('header.!!!.sig')).toEqual({});
  });
});

describe('getHotelIdFromToken', () => {
  it('returns hotel_id when present in the payload', () => {
    const token = makeJwt({ hotel_id: 'hotel-99' });
    expect(getHotelIdFromToken(token)).toBe('hotel-99');
  });

  it('returns null when hotel_id is absent from the payload', () => {
    const token = makeJwt({ sub: 'user-1' });
    expect(getHotelIdFromToken(token)).toBeNull();
  });

  it('returns null when hotel_id is not a string', () => {
    const token = makeJwt({ hotel_id: 123 });
    expect(getHotelIdFromToken(token)).toBeNull();
  });

  it('returns null when hotel_id is an empty string', () => {
    const token = makeJwt({ hotel_id: '' });
    expect(getHotelIdFromToken(token)).toBeNull();
  });

  it('returns null for a malformed token', () => {
    expect(getHotelIdFromToken('bad-token')).toBeNull();
  });
});

describe('bookingService — handleResponse success-path JSON failure', () => {
  beforeEach(() => mockFetch.mockReset());

  it('throws service-unavailable error when successful response body is not valid JSON', async () => {
    const badSuccessResponse = {
      ok: true,
      url: 'http://example.com/api',
      json: () => Promise.reject(new Error('parse error')),
    } as unknown as Response;
    mockFetch.mockResolvedValueOnce(badSuccessResponse);
    await expect(bookingService.getHotelReviews('hotel-123')).rejects.toThrow(
      'Service unavailable',
    );
  });
});

describe('bookingService.getHotelBookings', () => {
  beforeEach(() => mockFetch.mockReset());

  const mockHotelBookings: HotelBooking[] = [
    {
      id: 'bk-001', codigo: 'RES001', viajeroId: 'vj-aaa', habitacionId: 'rm-1',
      fechaCheckIn: '2026-09-01T00:00:00', fechaCheckOut: '2026-09-05T00:00:00',
      numHuespedes: 2, estado: 'PENDIENTE', subtotal: 400, impuestos: 80, total: 480, moneda: 'USD',
    },
    {
      id: 'bk-002', codigo: 'RES002', viajeroId: 'vj-bbb', habitacionId: 'rm-2',
      fechaCheckIn: '2026-10-01T00:00:00', fechaCheckOut: '2026-10-03T00:00:00',
      numHuespedes: 1, estado: 'CONFIRMADO', subtotal: 200, impuestos: 40, total: 240, moneda: 'EUR',
    },
  ];

  it('returns hotel bookings array on success', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockHotelBookings));
    const result = await bookingService.getHotelBookings('hotel-1', 'token');
    expect(result).toEqual(mockHotelBookings);
  });

  it('calls the correct endpoint with hotelId query param', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockHotelBookings));
    await bookingService.getHotelBookings('hotel-1', 'token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/booking/bookings_hotel?hotelId=hotel-1'),
      expect.any(Object),
    );
  });

  it('sends Authorization Bearer header', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse(mockHotelBookings));
    await bookingService.getHotelBookings('hotel-1', 'my-token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }),
    );
  });

  it('returns empty array when no bookings exist', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse([]));
    const result = await bookingService.getHotelBookings('hotel-1', 'token');
    expect(result).toEqual([]);
  });

  it('throws error with detail message on 403 forbidden', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(403, 'Forbidden'));
    await expect(bookingService.getHotelBookings('hotel-1', 'bad-token')).rejects.toThrow(
      'Forbidden',
    );
  });

  it('throws error on 404 hotel not found', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(404, 'Hotel not found'));
    await expect(bookingService.getHotelBookings('hotel-x', 'token')).rejects.toThrow(
      'Hotel not found',
    );
  });
});
