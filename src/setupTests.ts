import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for jsdom (needed by react-router)
import { TextEncoder, TextDecoder } from 'util';

if (!global.TextEncoder) {
	// @ts-ignore
	global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
	// @ts-ignore
	global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

// Mock IntersectionObserver — jsdom does not implement this browser API.
// Components that use it (e.g. scroll-spy tabs) work fine in the browser
// but would throw ReferenceError in the Jest/jsdom environment without this stub.
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  observe    = jest.fn();
  unobserve  = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn((): IntersectionObserverEntry[] => []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

