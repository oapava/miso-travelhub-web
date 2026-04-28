import { AUTH_BASE_URL, BOOKING_BASE_URL, SEARCH_BASE_URL } from '@/config/env';

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

/** A booking row as returned by /api/v1/booking/bookings_hotel */
export interface HotelBooking {
  id: string;
  codigo: string;
  viajeroId: string;
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

  /** Fetch all bookings for the hotel identified by `hotelId`, auth required. */
  async getHotelBookings(hotelId: string, accessToken: string): Promise<HotelBooking[]> {
    const query = new URLSearchParams({ hotelId });
    const response = await fetch(
      `${SEARCH_BASE_URL}/api/v1/booking/bookings_hotel?${query.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return handleResponse<HotelBooking[]>(response);
  },

  /** Fetch all bookings for the authenticated traveler user */
  async getMyBookings(accessToken: string): Promise<BookingResponse[]> {
    const response = await fetch(`${SEARCH_BASE_URL}/api/v1/booking/get_bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse<BookingResponse[]>(response);
  },
};
