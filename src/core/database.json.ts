import { kv } from '@vercel/kv';

export const db = {
  getTable: async (table: string) => {
    try {
      const data = await kv.get<any[]>(table);
      return data || [];
    } catch (e) {
      console.error(`Error reading ${table} from KV:`, e);
      return [];
    }
  },
  
  insert: async (table: string, record: any) => {
    try {
      const data = (await kv.get<any[]>(table)) || [];
      data.push(record);
      await kv.set(table, data);
      return record;
    } catch (e) {
      console.error(`Error inserting into ${table}:`, e);
      return null;
    }
  },

  update: async (table: string, id: string, updates: any) => {
    try {
      const data = (await kv.get<any[]>(table)) || [];
      const index = data.findIndex((item) => item.id === id);
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        await kv.set(table, data);
        return data[index];
      }
      return null;
    } catch (e) {
      console.error(`Error updating ${table}:`, e);
      return null;
    }
  },

  delete: async (table: string, id: string) => {
    try {
      let data = (await kv.get<any[]>(table)) || [];
      const initialLength = data.length;
      data = data.filter((item) => item.id !== id);
      if (data.length !== initialLength) {
        await kv.set(table, data);
        return true;
      }
      return false;
    } catch (e) {
      console.error(`Error deleting from ${table}:`, e);
      return false;
    }
  }
};
