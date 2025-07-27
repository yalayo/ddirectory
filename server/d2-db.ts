// Cloudflare D2 database connection and utilities
import type { D1Database } from '@cloudflare/workers-types';

// Environment binding for D2 database
export interface Env {
  DB: D1Database;
  SESSION_SECRET: string;
  NODE_ENV: string;
}

// Database utility functions for D2
export class D2DatabaseService {
  constructor(private db: D1Database) {}

  // Execute a query with parameters
  async query(sql: string, params: any[] = []) {
    try {
      const stmt = this.db.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).all();
      }
      return await stmt.all();
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Execute a single query and return first result
  async queryFirst(sql: string, params: any[] = []) {
    try {
      const stmt = this.db.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).first();
      }
      return await stmt.first();
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Execute an insert/update/delete and return metadata
  async execute(sql: string, params: any[] = []) {
    try {
      const stmt = this.db.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).run();
      }
      return await stmt.run();
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  }

  // Batch execute multiple statements
  async batch(statements: Array<{ sql: string; params?: any[] }>) {
    try {
      const preparedStatements = statements.map(({ sql, params = [] }) => {
        const stmt = this.db.prepare(sql);
        return params.length > 0 ? stmt.bind(...params) : stmt;
      });
      return await this.db.batch(preparedStatements);
    } catch (error) {
      console.error('Database batch error:', error);
      throw error;
    }
  }
}

// Global database instance
let dbService: D2DatabaseService | null = null;

export function initializeDatabase(db: D1Database) {
  dbService = new D2DatabaseService(db);
  return dbService;
}

export function getDatabase(): D2DatabaseService {
  if (!dbService) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return dbService;
}