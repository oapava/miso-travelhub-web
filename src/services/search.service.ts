import { SEARCH_BASE_URL } from '@/config/env';

export interface RoomDetail {
  id: string;
  nombre_hotel: string;
  precio: number;
  moneda: string;
  direccion: string;
  capacidad_maxima: number;
  distancia?: string;
  acceso?: string;
  estrellas?: number;
  tipo_habitacion?: string;
  tipo_cama?: string[];
  tamano_habitacion?: string;
  amenidades?: string[];
  imagenes?: string[];
  latitud?: number;
  longitud?: number;
}

export interface SearchRoomsParams {
  ciudad: string;
  checkin: string;  // "YYYY-MM-DD"
  checkout: string; // "YYYY-MM-DD"
  group: number;
  rooms: number;
}

export interface HabitacionDisponible {
  id: string;
  nombre_hotel: string;
  precio: number;
  direccion: string;
  capacidad_maxima: number;
  distancia?: string;
  acceso?: string;
  estrellas?: number;
  puntuacion_resena?: number;
  cantidad_resenas?: number;
  tipo_habitacion?: string;
  tipo_cama?: string[];
  tamano_habitacion?: string;
  amenidades?: string[];
  imagenes?: string[];
}

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

export const searchService = {
  async searchRooms(params: SearchRoomsParams): Promise<HabitacionDisponible[]> {
    const query = new URLSearchParams({
      ciudad: params.ciudad,
      checkin: params.checkin,
      checkout: params.checkout,
      group: String(params.group),
      rooms: String(params.rooms),
    });

    const response = await fetch(`${SEARCH_BASE_URL}/search/search_rooms?${query.toString()}`);
    return handleResponse<HabitacionDisponible[]>(response);
  },

  async getDetailRoom(habitacionId: string, checkin: string, checkout: string): Promise<RoomDetail> {
    const query = new URLSearchParams({ habitacionId, checkin, checkout });
    const response = await fetch(`${SEARCH_BASE_URL}/search/detail_room?${query.toString()}`);
    return handleResponse<RoomDetail>(response);
  
  },

  async searchCities(): Promise<string[]> {
    const response = await fetch(`${SEARCH_BASE_URL}/search/search_cities`);
    const data = await handleResponse<unknown>(response);
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
      if (typeof item === 'string') return item;
      // Handle possible object formats: { ciudad } | { name } | { city }
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return String(obj['ciudad'] ?? obj['name'] ?? obj['city'] ?? JSON.stringify(item));
      }
      return String(item);
    });
  },
};
