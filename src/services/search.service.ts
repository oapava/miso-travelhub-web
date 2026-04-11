import { SEARCH_BASE_URL } from '@/config/env';

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
  return response.json() as Promise<T>;
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
};
