/**
 * SQLite Database Schema and Migrations
 * Versioned migrations - never delete data to fix errors
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'study_app.db';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.closeSync();
    db = null;
  }
}

// Migration version tracking table
const createMigrationsTable = `
  CREATE TABLE IF NOT EXISTS _migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

// Get current migration version
export function getCurrentMigrationVersion(database: SQLite.SQLiteDatabase): number {
  try {
    const result = database.getFirstSync<{ version: number }>(
      'SELECT MAX(version) as version FROM _migrations'
    );
    return result?.version ?? 0;
  } catch {
    return 0;
  }
}

// Record migration
function recordMigration(database: SQLite.SQLiteDatabase, version: number) {
  database.runSync('INSERT INTO _migrations (version) VALUES (?)', [version]);
}

// ==================== MIGRATION 1: Initial Schema ====================
const migration1 = () => `
  -- Settings table (user preferences)
  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Subjects (Disciplinas)
  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Topics (Matérias/Conceitos within subjects)
  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );

  -- Concepts (individual study items)
  CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    title TEXT NOT NULL,
    explanation TEXT,
    question TEXT,
    answer TEXT,
    notes TEXT,
    difficulty REAL DEFAULT 0.5,
    mastery_level REAL DEFAULT 0,
    last_reviewed_at TEXT,
    next_review_at TEXT,
    review_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  );

  -- Flashcards
  CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    concept_id TEXT,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    deck_name TEXT DEFAULT 'Default',
    difficulty REAL DEFAULT 0.5,
    last_reviewed_at TEXT,
    next_review_at TEXT,
    review_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE SET NULL
  );

  -- Study Sessions
  CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    subject_id TEXT,
    topic_id TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_seconds INTEGER DEFAULT 0,
    focus_score REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
  );

  -- Reviews (SRS tracking)
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    concept_id TEXT,
    flashcard_id TEXT,
    rating INTEGER NOT NULL, -- 1-4 scale
    interval_days INTEGER DEFAULT 0,
    ease_factor REAL DEFAULT 2.5,
    reviewed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
    FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
  );

  -- Feynman Notes
  CREATE TABLE IF NOT EXISTS feynman_notes (
    id TEXT PRIMARY KEY,
    concept_id TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    explanation TEXT NOT NULL,
    gaps_identified TEXT,
    simplified_explanation TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
  );

  -- Connections (elaboration/analogies)
  CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    concept_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'analogy', 'memory_aid', 'curiosity', 'personal_impact', 'humor'
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
  );

  -- Reminders
  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    scheduled_at TEXT NOT NULL,
    repeat_pattern TEXT, -- 'daily', 'weekly', 'custom'
    enabled INTEGER DEFAULT 1,
    notification_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_concepts_topic ON concepts(topic_id);
  CREATE INDEX IF NOT EXISTS idx_concepts_next_review ON concepts(next_review_at);
  CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review_at);
  CREATE INDEX IF NOT EXISTS idx_reviews_concept ON reviews(concept_id);
  CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject_id);
  
  -- Full-text search for concepts
  CREATE VIRTUAL TABLE IF NOT EXISTS concepts_fts USING fts5(
    title, explanation, question, answer, notes,
    content='concepts',
    content_rowid='rowid'
  );

  -- Triggers for FTS
  CREATE TRIGGER IF NOT EXISTS concepts_ai AFTER INSERT ON concepts BEGIN
    INSERT INTO concepts_fts(rowid, title, explanation, question, answer, notes)
    VALUES (NEW.rowid, NEW.title, NEW.explanation, NEW.question, NEW.answer, NEW.notes);
  END;

  CREATE TRIGGER IF NOT EXISTS concepts_ad AFTER DELETE ON concepts BEGIN
    INSERT INTO concepts_fts(concepts_fts, rowid, title, explanation, question, answer, notes)
    VALUES('delete', OLD.rowid, OLD.title, OLD.explanation, OLD.question, OLD.answer, OLD.notes);
  END;

  CREATE TRIGGER IF NOT EXISTS concepts_au AFTER UPDATE ON concepts BEGIN
    INSERT INTO concepts_fts(concepts_fts, rowid, title, explanation, question, answer, notes)
    VALUES('delete', OLD.rowid, OLD.title, OLD.explanation, OLD.question, OLD.answer, OLD.notes);
    INSERT INTO concepts_fts(rowid, title, explanation, question, answer, notes)
    VALUES (NEW.rowid, NEW.title, NEW.explanation, NEW.question, NEW.answer, NEW.notes);
  END;
`;

// ==================== Run Migrations ====================
export function runMigrations(): void {
  const database = getDatabase();
  
  // Create migrations table
  database.execSync(createMigrationsTable);
  
  const currentVersion = getCurrentMigrationVersion(database);
  const targetVersion = 1; // Current schema version
  
  if (currentVersion >= targetVersion) {
    return; // Already up to date
  }
  
  // Run pending migrations
  if (currentVersion < 1) {
    database.execSync(migration1());
    recordMigration(database, 1);
  }
  
  // Add more migrations here as needed in the future
  // if (currentVersion < 2) { ... }
}

// Initialize database with migrations
export function initializeDatabase(): void {
  runMigrations();
}
