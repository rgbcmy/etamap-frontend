import type { ServiceConnection, SavedLayerConfig } from '../types/dataSource';

const DB_NAME = 'DataSourceDB';
const DB_VERSION = 1;

const STORES = {
  CONNECTIONS: 'connections',
  LAYERS: 'layers',
  CAPABILITIES_CACHE: 'capabilities_cache',
};

// 初始化数据库
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.CONNECTIONS)) {
        const connectionStore = db.createObjectStore(STORES.CONNECTIONS, {
          keyPath: 'id',
        });
        connectionStore.createIndex('type', 'type', { unique: false });
        connectionStore.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.LAYERS)) {
        const layerStore = db.createObjectStore(STORES.LAYERS, {
          keyPath: 'id',
        });
        layerStore.createIndex('connectionId', 'connectionId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CAPABILITIES_CACHE)) {
        const cacheStore = db.createObjectStore(STORES.CAPABILITIES_CACHE, {
          keyPath: 'connectionId',
        });
        cacheStore.createIndex('fetchedAt', 'fetchedAt', { unique: false });
      }
    };
  });
}

async function performDBOperation<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest
): Promise<T> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ==================== Connections ====================

export async function getAllConnections(): Promise<ServiceConnection[]> {
  return performDBOperation(
    STORES.CONNECTIONS,
    'readonly',
    (store) => store.getAll()
  );
}

export async function getConnection(id: string): Promise<ServiceConnection | undefined> {
  return performDBOperation(
    STORES.CONNECTIONS,
    'readonly',
    (store) => store.get(id)
  );
}

export async function saveConnection(connection: ServiceConnection): Promise<void> {
  return performDBOperation(
    STORES.CONNECTIONS,
    'readwrite',
    (store) => store.put(connection)
  );
}

export async function deleteConnection(id: string): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction(
    [STORES.CONNECTIONS, STORES.LAYERS, STORES.CAPABILITIES_CACHE],
    'readwrite'
  );

  transaction.objectStore(STORES.CONNECTIONS).delete(id);

  const layerStore = transaction.objectStore(STORES.LAYERS);
  const layerIndex = layerStore.index('connectionId');
  const layerRequest = layerIndex.openCursor(IDBKeyRange.only(id));

  layerRequest.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest).result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  transaction.objectStore(STORES.CAPABILITIES_CACHE).delete(id);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// ==================== Layers ====================

export async function getAllLayers(): Promise<SavedLayerConfig[]> {
  return performDBOperation(
    STORES.LAYERS,
    'readonly',
    (store) => store.getAll()
  );
}

export async function saveDatasource(config: SavedLayerConfig): Promise<void> {
  return performDBOperation(
    STORES.LAYERS,
    'readwrite',
    (store) => store.put(config)
  );
}

export async function deleteLayer(id: string): Promise<void> {
  return performDBOperation(
    STORES.LAYERS,
    'readwrite',
    (store) => store.delete(id)
  );
}

// ==================== Capabilities Cache ====================

interface CapabilitiesCache {
  connectionId: string;
  data: any;
  fetchedAt: string;
  expiresAt: string;
}

export async function getCapabilitiesCache(
  connectionId: string
): Promise<CapabilitiesCache | undefined> {
  const cache = await performDBOperation<CapabilitiesCache | undefined>(
    STORES.CAPABILITIES_CACHE,
    'readonly',
    (store) => store.get(connectionId)
  );

  if (cache && new Date(cache.expiresAt) < new Date()) {
    await deleteCapabilitiesCache(connectionId);
    return undefined;
  }

  return cache;
}

export async function saveCapabilitiesCache(
  connectionId: string,
  data: any,
  ttlHours: number = 24
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

  const cache: CapabilitiesCache = {
    connectionId,
    data,
    fetchedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  return performDBOperation(
    STORES.CAPABILITIES_CACHE,
    'readwrite',
    (store) => store.put(cache)
  );
}

export async function deleteCapabilitiesCache(connectionId: string): Promise<void> {
  return performDBOperation(
    STORES.CAPABILITIES_CACHE,
    'readwrite',
    (store) => store.delete(connectionId)
  );
}