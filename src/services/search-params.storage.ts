const PARAMS_KEY = 'travelhub_last_search';
const RESULTS_KEY = 'travelhub_last_results';

export interface LastSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

function sessionGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function sessionSet(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage no disponible
  }
}

function sessionRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // noop
  }
}

export const searchParamsStorage = {
  save(params: LastSearchParams): void {
    sessionSet(PARAMS_KEY, params);
  },

  load(): LastSearchParams | null {
    return sessionGet<LastSearchParams>(PARAMS_KEY);
  },

  clear(): void {
    sessionRemove(PARAMS_KEY);
  },
};

export const searchResultsStorage = {
  save<T>(results: T[]): void {
    sessionSet(RESULTS_KEY, results);
  },

  load<T>(): T[] | null {
    return sessionGet<T[]>(RESULTS_KEY);
  },

  clear(): void {
    sessionRemove(RESULTS_KEY);
  },
};
