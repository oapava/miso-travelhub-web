import { searchService } from '@/services/search.service';
import type { HabitacionDisponible, RoomDetail } from '@/services/search.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockRoom: HabitacionDisponible = {
  id: 'room-1',
  nombre_hotel: 'Hotel Bogotá',
  precio: 250000,
  direccion: 'Calle 100 #15-20',
  capacidad_maxima: 2,
  distancia: '1.5 km',
  acceso: '10 min metro',
  estrellas: 4,
  puntuacion_resena: 8.7,
  cantidad_resenas: 150,
  tipo_habitacion: 'Deluxe',
  tipo_cama: ['King'],
  tamano_habitacion: '30 m²',
  amenidades: ['WiFi', 'Pool'],
  imagenes: ['https://example.com/img1.jpg'],
};

const searchParams = {
  ciudad: 'Bogotá',
  checkin: '2024-06-01',
  checkout: '2024-06-05',
  group: 2,
  rooms: 1,
};

beforeEach(() => {
  mockFetch.mockClear();
});

describe('searchService.searchRooms', () => {
  it('returns array of available rooms on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockRoom],
    });

    const result = await searchService.searchRooms(searchParams);

    expect(result).toEqual([mockRoom]);
  });

  it('calls fetch with the correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await searchService.searchRooms(searchParams);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/search/search_rooms'),
    );
  });

  it('includes all query parameters in the URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await searchService.searchRooms(searchParams);

    const calledUrl: string = (mockFetch.mock.calls[0] as [string])[0];
    expect(calledUrl).toContain('ciudad=Bogot%C3%A1');
    expect(calledUrl).toContain('checkin=2024-06-01');
    expect(calledUrl).toContain('checkout=2024-06-05');
    expect(calledUrl).toContain('group=2');
    expect(calledUrl).toContain('rooms=1');
  });

  it('throws error with detail message on 400 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Ciudad no encontrada' }),
    });

    await expect(searchService.searchRooms(searchParams)).rejects.toThrow('Ciudad no encontrada');
  });

  it('throws error with HTTP status fallback when json parsing fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => { throw new Error('no json'); },
    });

    await expect(searchService.searchRooms(searchParams)).rejects.toThrow('HTTP 503');
  });

  it('throws error with joined message for array detail (422 validation)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        detail: [
          { msg: 'checkin is required', loc: ['query', 'checkin'] },
          { msg: 'checkout is required', loc: ['query', 'checkout'] },
        ],
      }),
    });

    await expect(searchService.searchRooms(searchParams)).rejects.toThrow(
      'checkin is required, checkout is required',
    );
  });

  it('returns empty array when no rooms are available', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const result = await searchService.searchRooms(searchParams);

    expect(result).toEqual([]);
  });

  it('converts group and rooms to string in query params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await searchService.searchRooms({ ...searchParams, group: 3, rooms: 2 });

    const calledUrl: string = (mockFetch.mock.calls[0] as [string])[0];
    expect(calledUrl).toContain('group=3');
    expect(calledUrl).toContain('rooms=2');
  });
});

describe('searchService.getDetailRoom', () => {
  const mockDetail: RoomDetail = {
    id: '22222222-2222-2222-2222-000000000001',
    nombre_hotel: 'Hotel Treta',
    precio: 100.0,
    moneda: 'EUR',
    direccion: 'Calle 123',
    capacidad_maxima: 2,
    distancia: '3 km del centro',
    acceso: 'Metro',
    estrellas: 5,
    tipo_habitacion: 'deluxe',
    tipo_cama: ['king'],
    tamano_habitacion: '35m2',
    amenidades: ['AC', 'WiFi'],
    imagenes: ['img1.jpg'],
    latitud: 50.0755,
    longitud: 14.4378,
  };

  it('returns room detail on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockDetail });
    const result = await searchService.getDetailRoom(
      '22222222-2222-2222-2222-000000000001',
      '2026-09-01',
      '2026-09-12',
    );
    expect(result).toEqual(mockDetail);
  });

  it('calls the correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockDetail });
    await searchService.getDetailRoom('room-id', '2026-09-01', '2026-09-12');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/search/detail_room'));
  });

  it('includes habitacionId, checkin and checkout as query params', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockDetail });
    await searchService.getDetailRoom('room-abc', '2026-09-01', '2026-09-12');
    const calledUrl: string = (mockFetch.mock.calls[0] as [string])[0];
    expect(calledUrl).toContain('habitacionId=room-abc');
    expect(calledUrl).toContain('checkin=2026-09-01');
    expect(calledUrl).toContain('checkout=2026-09-12');
  });

  it('throws error with detail message on 404 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Room not found' }),
    });
    await expect(
      searchService.getDetailRoom('bad-id', '2026-09-01', '2026-09-12'),
    ).rejects.toThrow('Room not found');
  });

  it('throws HTTP status error when json parsing fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => { throw new Error('no json'); },
    });
    await expect(
      searchService.getDetailRoom('room-id', '2026-09-01', '2026-09-12'),
    ).rejects.toThrow('HTTP 503');
  });
});
