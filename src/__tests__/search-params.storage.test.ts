import {
  searchParamsStorage,
  searchResultsStorage,
} from '@/services/search-params.storage';
import type { LastSearchParams } from '@/services/search-params.storage';

const mockParams: LastSearchParams = {
  location: 'Bogotá',
  checkIn: '2024-06-01',
  checkOut: '2024-06-05',
  rooms: 1,
  adults: 2,
  children: 0,
};

beforeEach(() => {
  sessionStorage.clear();
});

// ─── searchParamsStorage ───────────────────────────────────────────────────────

describe('searchParamsStorage.save', () => {
  it('saves params to sessionStorage', () => {
    searchParamsStorage.save(mockParams);
    const raw = sessionStorage.getItem('travelhub_last_search');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(mockParams);
  });
});

describe('searchParamsStorage.load', () => {
  it('returns saved params', () => {
    searchParamsStorage.save(mockParams);
    expect(searchParamsStorage.load()).toEqual(mockParams);
  });

  it('returns null when nothing is saved', () => {
    expect(searchParamsStorage.load()).toBeNull();
  });

  it('returns null when stored value is invalid JSON', () => {
    sessionStorage.setItem('travelhub_last_search', 'not-json');
    expect(searchParamsStorage.load()).toBeNull();
  });
});

describe('searchParamsStorage.clear', () => {
  it('removes saved params from sessionStorage', () => {
    searchParamsStorage.save(mockParams);
    searchParamsStorage.clear();
    expect(searchParamsStorage.load()).toBeNull();
  });

  it('does not throw when nothing is saved', () => {
    expect(() => searchParamsStorage.clear()).not.toThrow();
  });
});

// ─── searchResultsStorage ─────────────────────────────────────────────────────

interface Room {
  id: string;
  name: string;
}

const mockResults: Room[] = [
  { id: 'r1', name: 'Deluxe Suite' },
  { id: 'r2', name: 'Standard Room' },
];

describe('searchResultsStorage.save', () => {
  it('saves results array to sessionStorage', () => {
    searchResultsStorage.save(mockResults);
    const raw = sessionStorage.getItem('travelhub_last_results');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(mockResults);
  });
});

describe('searchResultsStorage.load', () => {
  it('returns saved results array', () => {
    searchResultsStorage.save(mockResults);
    expect(searchResultsStorage.load<Room>()).toEqual(mockResults);
  });

  it('returns null when nothing is saved', () => {
    expect(searchResultsStorage.load()).toBeNull();
  });

  it('returns null when stored value is invalid JSON', () => {
    sessionStorage.setItem('travelhub_last_results', '{bad-json}');
    expect(searchResultsStorage.load()).toBeNull();
  });
});

describe('searchResultsStorage.clear', () => {
  it('removes saved results from sessionStorage', () => {
    searchResultsStorage.save(mockResults);
    searchResultsStorage.clear();
    expect(searchResultsStorage.load()).toBeNull();
  });

  it('does not throw when nothing is saved', () => {
    expect(() => searchResultsStorage.clear()).not.toThrow();
  });
});
