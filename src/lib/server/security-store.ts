import { getServerConfig } from "@/lib/server/config";

export interface SecurityStore {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string, ttlSeconds: number): Promise<number>;
}

type MemoryRecord = {
  value: string;
  expiresAt: number;
};

class MemorySecurityStore implements SecurityStore {
  private records = new Map<string, MemoryRecord>();

  private cleanup(key: string) {
    const record = this.records.get(key);
    if (!record) {
      return null;
    }

    if (record.expiresAt <= Date.now()) {
      this.records.delete(key);
      return null;
    }

    return record;
  }

  async get(key: string) {
    return this.cleanup(key)?.value ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number) {
    this.records.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string) {
    this.records.delete(key);
  }

  async incr(key: string, ttlSeconds: number) {
    const record = this.cleanup(key);
    const current = record ? Number(record.value) : 0;
    const next = current + 1;
    await this.set(key, String(next), ttlSeconds);
    return next;
  }
}

const globalStore = globalThis as typeof globalThis & {
  __pdaPortalSecurityStore?: SecurityStore | null;
};

export function getSecurityStore(): SecurityStore | null {
  if (globalStore.__pdaPortalSecurityStore !== undefined) {
    return globalStore.__pdaPortalSecurityStore;
  }

  const config = getServerConfig();

  if (config.security.useMemoryStore) {
    globalStore.__pdaPortalSecurityStore = new MemorySecurityStore();
    return globalStore.__pdaPortalSecurityStore;
  }

  globalStore.__pdaPortalSecurityStore = null;
  return null;
}

export function resetSecurityStoreForTests() {
  globalStore.__pdaPortalSecurityStore = undefined;
}
