/**
 * Storage Polyfill for Sandboxed Environments
 *
 * Provides a memory-based fallback for localStorage and sessionStorage
 * when access is restricted by sandboxed environments like iframe previews.
 */
(function () {
  // Early exit if we're not in a browser
  if (typeof window === 'undefined') return;

  // Try to detect if storage is accessible
  let storageAccessRestricted = false;
  try {
    // Simple test for storage access
    window.localStorage.getItem('storage-test');
    window.sessionStorage.getItem('storage-test');
  } catch (e) {
    storageAccessRestricted = true;
  }

  // Only proceed if storage is restricted
  if (!storageAccessRestricted) return;

  // Create shared in-memory storage
  const createMemoryStorage = function () {
    return {
      _data: {},
      setItem: function (id, val) {
        this._data[id] = String(val);
      },
      getItem: function (id) {
        return this._data[id] || null;
      },
      removeItem: function (id) {
        delete this._data[id];
      },
      clear: function () {
        this._data = {};
      },
      key: function (i) {
        return Object.keys(this._data)[i] || null;
      },
      get length() {
        return Object.keys(this._data).length;
      },
    };
  };

  // Create two separate storage objects to mimic localStorage and sessionStorage
  const localStoragePolyfill = createMemoryStorage();
  const sessionStoragePolyfill = createMemoryStorage();

  // Safely apply localStorage polyfill if needed
  try {
    window.localStorage.getItem('test');
  } catch (e) {
    try {
      Object.defineProperty(window, 'localStorage', {
        value: localStoragePolyfill,
        configurable: true,
        enumerable: true,
        writable: false,
      });
    } catch (e) {
      console.warn('Failed to polyfill localStorage');
    }
  }

  // Safely apply sessionStorage polyfill if needed
  try {
    window.sessionStorage.getItem('test');
  } catch (e) {
    try {
      Object.defineProperty(window, 'sessionStorage', {
        value: sessionStoragePolyfill,
        configurable: true,
        enumerable: true,
        writable: false,
      });
    } catch (e) {
      console.warn('Failed to polyfill sessionStorage');
    }
  }

  // Add console message for debugging
  console.info('Storage polyfills applied for sandboxed environment');
})();
