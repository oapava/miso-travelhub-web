import { INVENTORY_BASE_URL } from '@/config/env';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A hotel room as returned by the inventory API. */
export interface HabitacionInventario {
  id: string;
  hotelId?: string;
  tipo?: string;
  tipo_habitacion?: string;
  tipo_cama?: string[];
  /** Maximum guest capacity — this is the field returned by the API. */
  capacidadMaxima?: number;
  categoria?: string;
  descripcion?: string;
  tamano_habitacion?: string;
  amenidades?: string[];
  imagenes?: string[];
}

/** A tariff (base or variation) for a room. */
export interface Tarifa {
  id: string;
  habitacionId?: string;
  /** Price per night before discount. */
  precioBase: number;
  /** Discount percentage 0–100. */
  descuento: number;
  /** Currency code as configured by the hotel, e.g. "COP", "USD". */
  moneda?: string;
  /** ISO date-time string — null for the base tariff (always active). */
  fechaInicio?: string | null;
  /** ISO date-time string — null for the base tariff (always active). */
  fechaFin?: string | null;
}

/** The currently applicable tariff for a room on a given date. */
export interface TarifaVigente {
  precioBase: number;
  descuento: number;
  precioFinal: number;
}

/** Request body for creating a tariff (base or variation). */
export interface CreateTarifaRequest {
  /** Room ID — required in the request body by the API (in addition to the URL path). */
  habitacionId: string;
  precioBase: number;
  /** Discount percentage 0–100. */
  descuento: number;
  /** ISO date-time string, e.g. "2026-11-01T00:00:00+00:00". */
  fechaInicio: string;
  /** ISO date-time string, e.g. "2026-11-30T23:59:59+00:00". */
  fechaFin: string;
}

/** Partial update body for PATCH /tarifas/{tarifa_id}. All fields are optional. */
export interface PatchTarifaRequest {
  precioBase?: number;
  /** Discount percentage 0–100. */
  descuento?: number;
  /** ISO date-time string. */
  fechaInicio?: string;
  /** ISO date-time string. */
  fechaFin?: string;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
    const detail = error.detail;
    if (Array.isArray(detail)) {
      const message = detail
        .map((e: { msg?: string }) => e.msg ?? 'Validation error')
        .join(', ');
      throw new Error(message);
    }
    throw new Error(typeof detail === 'string' ? detail : `HTTP ${response.status}`);
  }
  // 204 No Content has no body
  if (response.status === 204) return undefined as unknown as T;
  return response.json().catch(() => {
    throw new Error(`Service unavailable (${response.url})`);
  }) as Promise<T>;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const inventoryService = {
  /**
   * Get all rooms that belong to the given hotel.
   * GET /api/v1/inventory/habitaciones?hotel_id={hotelId}
   */
  async getHotelRooms(
    hotelId: string,
    accessToken: string,
  ): Promise<HabitacionInventario[]> {
    const query = new URLSearchParams({ hotel_id: hotelId });
    const response = await fetch(
      `${INVENTORY_BASE_URL}/api/v1/inventory/hoteles/${query.get('hotel_id')}/habitaciones`,
      
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return handleResponse<HabitacionInventario[]>(response);
  },

  /**
   * Get the base (permanent) tariff for a room.
   * GET /api/v1/inventory/habitaciones/{roomId}/tarifas/base
   */
  async getBaseTariff(roomId: string, accessToken: string): Promise<Tarifa> {
    const response = await fetch(
      `${INVENTORY_BASE_URL}/api/v1/inventory/habitaciones/${roomId}/tarifas/base`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return handleResponse<Tarifa>(response);
  },

  /**
   * Get all tariffs (base + variations) for a room.
   * GET /api/v1/inventory/habitaciones/{roomId}/tarifas
   */
  async getRoomTariffs(roomId: string, accessToken: string): Promise<Tarifa[]> {
    const response = await fetch(
      `${INVENTORY_BASE_URL}/api/v1/inventory/habitaciones/${roomId}/tarifas`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return handleResponse<Tarifa[]>(response);
  },

  /**
   * Get the applicable tariff for a room on a specific date.
   * GET /api/v1/inventory/tarifas/vigente?habitacion_id={roomId}&fecha={fecha}
   *
   * @param fecha - ISO date-time string, e.g. "2026-11-29T12:00:00+00:00"
   */
  async getTariffByDate(
    roomId: string,
    fecha: string,
    accessToken: string,
  ): Promise<TarifaVigente> {
    const query = new URLSearchParams({ habitacion_id: roomId, fecha });
    const response = await fetch(
      `${INVENTORY_BASE_URL}/api/v1/inventory/tarifas/vigente?${query.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return handleResponse<TarifaVigente>(response);
  },

  /**
   * Create a tariff variation for a room.
   * POST /api/v1/inventory/habitaciones/{roomId}/tarifas
   */
  async createTariff(
    roomId: string,
    request: CreateTarifaRequest,
    accessToken: string,
  ): Promise<Tarifa> {
    const response = await fetch(
      `${INVENTORY_BASE_URL}/api/v1/inventory/habitaciones/${roomId}/tarifas`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    );
    return handleResponse<Tarifa>(response);
  },

  /**
   * Partially update a tariff (PATCH /api/v1/inventory/tarifas/{tariffId}).
   * Only the provided fields are updated.
   */
  async patchTariff(
    tariffId: string,
    request: PatchTarifaRequest,
    accessToken: string,
  ): Promise<Tarifa> {
    const response = await fetch(
      `${INVENTORY_BASE_URL}/api/v1/inventory/tarifas/${tariffId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    );
    return handleResponse<Tarifa>(response);
  },

  /**
   * Delete a tariff variation by its ID.
   * DELETE /api/v1/inventory/tarifas/{tariffId}
   */
  async deleteTariff(tariffId: string, accessToken: string): Promise<void> {
    const response = await fetch(
      `${INVENTORY_BASE_URL}/api/v1/inventory/tarifas/${tariffId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return handleResponse<void>(response);
  },
};
