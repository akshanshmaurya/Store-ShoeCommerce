/**
 * Isolated, SSR-Safe Storage Adapter with Schema Versioning
 * Phase 5 — Cart & Wishlist Foundation
 * Prevents direct localStorage calls across UI components.
 */

export interface VersionedStorageEnvelope<T> {
  version: number;
  data: T;
  updatedAt: string; // ISO 8601 UTC
}

export class StorageAdapter {
  private static isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  /**
   * Read and parse stored payload with version validation and error recovery
   */
  static getItem<T>(key: string, currentVersion: number = 1): T | null {
    if (!this.isAvailable()) return null;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;

      const envelope: VersionedStorageEnvelope<T> = JSON.parse(raw);

      // Gracefully discard outdated schema versions
      if (!envelope || envelope.version !== currentVersion || !envelope.data) {
        window.localStorage.removeItem(key);
        return null;
      }

      return envelope.data;
    } catch {
      // Corrupted storage recovery
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore removal errors in restricted browser contexts
      }
      return null;
    }
  }

  /**
   * Save payload wrapped in versioned envelope
   */
  static setItem<T>(key: string, data: T, version: number = 1): boolean {
    if (!this.isAvailable()) return false;

    try {
      const envelope: VersionedStorageEnvelope<T> = {
        version,
        data,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(key, JSON.stringify(envelope));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  static removeItem(key: string): void {
    if (!this.isAvailable()) return;

    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore in restricted environments
    }
  }
}
