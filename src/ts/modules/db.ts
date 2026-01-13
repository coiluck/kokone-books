// db.ts
import Database from '@tauri-apps/plugin-sql';

const CURRENT_SCHEMA_VERSION = 1;
const DB_FILE = 'sqlite:kokone-books.db';

// 保存用
export interface BookItem {
  id: string;
  type: 'physical' | 'web';
  title: string;
  top_url: string | null;
  site_type: 'narou' | 'kakuyomu' | 'hameln' | 'hatenablog' | 'other' | null;
  tags: string[];
  created_at: string;
}

// DB用
interface BookTable {
  id: string;
  type: 'physical' | 'web';
  title: string;
  top_url: string | null;
  site_type: 'narou' | 'kakuyomu' | 'hameln' | 'hatenablog' | 'other' | null;
  tags: string;
  created_at: string;
}

let dbInstance: Database | null = null;

export async function initDB(): Promise<Database> {
  if (dbInstance) return dbInstance;

  try {
    const db = await Database.load(DB_FILE);
    // バージョン管理テーブルがなければ作る
    await db.execute(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    // 現在のバージョン
    const versionResult = await db.select<{ version: number }[]>(
      'SELECT version FROM schema_version LIMIT 1'
    );
    let currentVersion = versionResult.length > 0 ? versionResult[0].version : 0;

    console.log(`Current DB version: ${currentVersion}`);
    // migrate
    if (currentVersion < CURRENT_SCHEMA_VERSION) {
      console.log(`Migrating DB from v${currentVersion} to v${CURRENT_SCHEMA_VERSION}...`);
      await migrate(db, currentVersion, CURRENT_SCHEMA_VERSION);
    }
    dbInstance = db;
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function migrate(db: Database, oldVersion: number, newVersion: number) {
  // 0 -> 1
  if (oldVersion < 1) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('physical', 'web')),
        title TEXT NOT NULL,
        top_url TEXT,
        site_type TEXT,
        tags TEXT,
        created_at TEXT NOT NULL
      );
    `);
  }

  // 1 -> 2とかは後で追加していく

  const now = new Date().toISOString();

  if (oldVersion === 0) {
    // 初回なので INSERT
    await db.execute(
      'INSERT INTO schema_version (version, updated_at) VALUES ($1, $2)',
      [newVersion, now]
    );
  } else {
    // 2回目以降なので既存の行を UPDATE
    await db.execute(
      'UPDATE schema_version SET version = $1, updated_at = $2',
      [newVersion, now]
    );
  }
}

export async function addBook(book: BookItem) {
  const db = await initDB();
  await db.execute(
    'INSERT INTO books (id, type, title, top_url, site_type, tags, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [
      book.id,
      book.type,
      book.title,
      book.top_url,
      book.site_type,
      JSON.stringify(book.tags),
      book.created_at
    ]
  );
}

export async function getBooks(): Promise<BookItem[]> {
  const db = await initDB();
  const books = await db.select<BookTable[]>(
    'SELECT * FROM books'
  );
  return books.map((row) => ({
    ...row,
    tags: JSON.parse(row.tags)
  }));
}

export async function updateBook(book: BookItem) {
  const db = await initDB();
  await db.execute(
    'UPDATE books SET type = $1, title = $2, top_url = $3, site_type = $4, tags = $5, created_at = $6 WHERE id = $7',
    [
      book.type,
      book.title,
      book.top_url,
      book.site_type,
      JSON.stringify(book.tags),
      book.created_at,
      book.id
    ]
  );
}

export async function deleteBook(id: string) {
  const db = await initDB();
  await db.execute('DELETE FROM books WHERE id = $1', [id]);
}