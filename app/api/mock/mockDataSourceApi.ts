// mockDataSourceApi.ts
export type DataSource = {
  id: string;
  name: string;
  type: "XYZ" | "WMTS" | "WMS";
  url: string;
};

let mockDb: DataSource[] = [
  { id: "1", name: "OSM", type: "XYZ", url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png" },
  { id: "2", name: "Carto Light", type: "XYZ", url: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png" },
];

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const dataSourceApi = {
  async list(): Promise<DataSource[]> {
    await wait(300); // 模拟网络延迟
    return [...mockDb];
  },

  async get(id: string): Promise<DataSource | undefined> {
    await wait(200);
    return mockDb.find(s => s.id === id);
  },

  async create(data: Omit<DataSource, "id">): Promise<DataSource> {
    await wait(400);
    const newSource: DataSource = { id: String(Date.now()), ...data };
    mockDb.push(newSource);
    return newSource;
  },

  async update(id: string, patch: Partial<Omit<DataSource, "id">>): Promise<DataSource | null> {
    await wait(400);
    const idx = mockDb.findIndex(s => s.id === id);
    if (idx === -1) return null;
    mockDb[idx] = { ...mockDb[idx], ...patch };
    return mockDb[idx];
  },

  async remove(id: string): Promise<boolean> {
    await wait(300);
    const lenBefore = mockDb.length;
    mockDb = mockDb.filter(s => s.id !== id);
    return mockDb.length < lenBefore;
  },

  async clear(): Promise<void> {
    await wait(100);
    mockDb = [];
  },
};
