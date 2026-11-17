import { RoomItem, FloorInfo } from '../types';
import { Platform } from 'react-native';

// In-memory fallback for web and offline synchronization
let memoryCache: {
  rooms: RoomItem[];
  recentSearches: string[];
} = {
  rooms: [],
  recentSearches: ['AB 608', 'Physics Lab', 'Board Room', 'Apex Library'],
};

export const StorageService = {
  async init(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }
    try {
      const SQLite = await import('expo-sqlite');
      const db = await SQLite.openDatabaseAsync('campus_navigator.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS recent_searches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          query TEXT UNIQUE,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS offline_cache (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e) {
      console.warn('SQLite init skipped/failed, using memory storage:', e);
    }
  },

  async getRecentSearches(): Promise<string[]> {
    if (Platform.OS === 'web') {
      return memoryCache.recentSearches;
    }
    try {
      const SQLite = await import('expo-sqlite');
      const db = await SQLite.openDatabaseAsync('campus_navigator.db');
      const rows = await db.getAllAsync<{ query: string }>(
        'SELECT query FROM recent_searches ORDER BY timestamp DESC LIMIT 10;'
      );
      if (rows && rows.length > 0) {
        return rows.map((r) => r.query);
      }
    } catch (e) {
      // fallback
    }
    return memoryCache.recentSearches;
  },

  async addRecentSearch(query: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    // update memory
    memoryCache.recentSearches = [
      trimmed,
      ...memoryCache.recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, 10);

    if (Platform.OS === 'web') return;

    try {
      const SQLite = await import('expo-sqlite');
      const db = await SQLite.openDatabaseAsync('campus_navigator.db');
      await db.runAsync(
        'INSERT OR REPLACE INTO recent_searches (query, timestamp) VALUES (?, CURRENT_TIMESTAMP);',
        trimmed
      );
    } catch (e) {
      // ignore
    }
  },

  async clearRecentSearches(): Promise<void> {
    memoryCache.recentSearches = [];
    if (Platform.OS === 'web') return;
    try {
      const SQLite = await import('expo-sqlite');
      const db = await SQLite.openDatabaseAsync('campus_navigator.db');
      await db.runAsync('DELETE FROM recent_searches;');
    } catch (e) {
      // ignore
    }
  },
};
