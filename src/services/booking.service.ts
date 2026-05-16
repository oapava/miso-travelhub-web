import { BOOKING_BASE_URL, SEARCH_BASE_URL } from '@/config/env';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewHotel {
  id: string;
  viajeroId: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  verificada: boolean;
}

export interface BookingRequest {
  habitacionId: string;
  checkin: string;
  checkout: string;
  numHuespedes: number;
}

export interface ReviewRequest {
  habitacionId: string;
  calificacion: number;
  comentario: string;
}

export interface ReviewResponse {
  id: string;
  viajeroId: string;
  habitacionId: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  verificada: boolean;
}

export interface BookingResponse {
  id: string;
  codigo: string;
  viajeroId: string;
  habitacionId: string;
  fechaCheckIn: string;
  fechaCheckOut: string;
  numHuespedes: number;
  estado: string;
  subtotal: number;
  impuestos: number;
  total: number;
  moneda: string;
}

/**
 * A traveler booking as returned by /api/v1/booking/get_bookings.
 * Richer than BookingResponse — includes hotel & room details.
 */
export interface TravelerBooking {
  id: string;
  habitacionId: string;
  nombreUser: string;
  descripcion?: string;
  numHuespedes: number;
  fechaCheckIn: string;
  fechaCheckOut: string;
  estado: string;
  // Hotel info
  nombreHotel: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  latitud?: number;
  longitud?: number;
  estrellas?: number;
  distancia?: string;
  acceso?: string;
  // Room info
  tipo?: string;
  categoria?: string;
  imagenes?: string[];
  tipo_habitacion?: string;
  tipo_cama?: string[];
  tamano_habitacion?: string;
  amenidades?: string[];
  // Financial
  subtotal: number;
  impuestos: number;
  total: number;
  /** Not always returned by the API; optional for backward compat. */
  moneda?: string;
}

/** Optional filter params for GET /api/v1/booking/get_bookings */
export interface GetBookingsFilter {
  name?: string;
  bookingId?: string;
  email?: string;
  status?: string;
  checkin?: string;
  checkout?: string;
  /** ISO 4217 currency code — API converts all monetary values to this currency */
  moneda?: string;
}

/** A booking row as returned by /api/v1/booking/get_bookings */
export interface HotelBooking {
  id: string;
  codigo: string;
  viajeroId: string;
  /** Full name of the guest — preferred display name when available */
  nombreUser?: string;
  habitacionId: string;
  nombreHabitacion?: string;
  fechaCheckIn: string;
  fechaCheckOut: string;
  numHuespedes: number;
  estado: string;
  subtotal: number;
  impuestos: number;
  total: number;
  moneda: string;
  // ── Hotel / property context ───────────────────────────────────────────────
  nombreHotel?: string;
  ciudad?: string;
  pais?: string;
  // ── Room characteristics ───────────────────────────────────────────────────
  tipo_habitacion?: string;
  categoria?: string;
  tamano_habitacion?: string;
  // ── Operational fields (returned when available) ───────────────────────────
  /** Estimated check-in time, e.g. "3:00 PM" */
  horaEstimadaLlegada?: string;
  /** Free-text special requests left by the guest */
  solicitudesEspeciales?: string;
  /** Guest contact e-mail */
  emailHuesped?: string;
  /** Guest contact phone */
  telefonoHuesped?: string;
}

// ─── JWT helper (no external dependency) ─────────────────────────────────────

/**
 * Decode the payload of a JWT without verifying the signature.
 * Used only to extract claims like hotel_id that may not be returned by /me.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const part = token.split('.')[1];
    if (!part) return {};
    // base64url → base64
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function getHotelIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  return typeof payload.hotel_id === 'string' && payload.hotel_id ? payload.hotel_id : null;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
    const detail = error.detail;
    if (Array.isArray(detail)) {
      const message = detail.map((e: { msg?: string }) => e.msg ?? 'Validation error').join(', ');
      throw new Error(message);
    }
    throw new Error(typeof detail === 'string' ? detail : `HTTP ${response.status}`);
  }
  return response.json().catch(() => {
    throw new Error(`Service unavailable — check VITE_SEARCH_BASE_URL (${response.url})`);
  }) as Promise<T>;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const bookingService = {
  async getHotelReviews(hotelId: string): Promise<ReviewHotel[]> {
    const query = new URLSearchParams({ hotelId });
    const response = await fetch(
      `${BOOKING_BASE_URL}/api/v1/booking/reviews_hotel?${query.toString()}`,
    );
    return handleResponse<ReviewHotel[]>(response);
  },

  async postReview(request: ReviewRequest, accessToken: string): Promise<ReviewResponse> {
    const response = await fetch(`${SEARCH_BASE_URL}/api/v1/booking/reviews_hotel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return handleResponse<ReviewResponse>(response);
  },

  async bookRoom(request: BookingRequest, accessToken: string): Promise<BookingResponse> {
    const response = await fetch(`${BOOKING_BASE_URL}/api/v1/booking/booking_room`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return handleResponse<BookingResponse>(response);
  },

  /**
   * Fetch all bookings for the hotel identified by `hotelId`, auth required.
   * Pass `moneda` to receive monetary values converted to that currency.
   */
  async getHotelBookings(
    hotelId: string,
    accessToken: string,
    moneda?: string,
  ): Promise<HotelBooking[]> {
    const params: Record<string, string> = { hotel_id: hotelId };
    if (moneda) params['moneda'] = moneda;
    const query = new URLSearchParams(params);
    const response = await fetch(
      `${SEARCH_BASE_URL}/api/v1/booking/get_bookings?${query.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return handleResponse<HotelBooking[]>(response);
  },

  /**
   * Update the status of a booking (PATCH /api/v1/booking/update/:id).
   * Used by B2B hotel operators to confirm or cancel a reservation.
   *
   * @param bookingId - UUID of the booking to update
   * @param status    - New status value, e.g. "CONFIRMADA" | "CANCELADA"
   * @param accessToken - JWT bearer token
   */
  async updateBooking(
    bookingId: string,
    status: string,
    accessToken: string,
  ): Promise<HotelBooking> {
    const response = await fetch(
      `${BOOKING_BASE_URL}/api/v1/booking/update/${bookingId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      },
    );
    return handleResponse<HotelBooking>(response);
  },

  /**
   * Fetch bookings for the authenticated traveler.
   * Optional `filter` builds query params (name, bookingId, email, status, checkin, checkout).
   */
  async getMyBookings(accessToken: string, filter?: GetBookingsFilter): Promise<TravelerBooking[]> {
    const params: Record<string, string> = {};
    if (filter?.name)      params['name']      = filter.name;
    if (filter?.bookingId) params['bookingId'] = filter.bookingId;
    if (filter?.email)     params['email']     = filter.email;
    if (filter?.status)    params['status']    = filter.status;
    if (filter?.checkin)   params['checkin']   = filter.checkin;
    if (filter?.checkout)  params['checkout']  = filter.checkout;
    if (filter?.moneda)    params['moneda']    = filter.moneda;

    const qs = new URLSearchParams(params);
    const url = `${BOOKING_BASE_URL}/api/v1/booking/get_bookings${qs.toString() ? `?${qs.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse<TravelerBooking[]>(response);
  },
};
