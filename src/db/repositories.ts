/**
 * Database Repositories - CRUD operations
 * Clean separation between data access and business logic
 */

import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './schema';

// ==================== Types ====================
export interface Subject {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Concept {
  id: string;
  topic_id: string;
  title: string;
  explanation?: string;
  question?: string;
  answer?: string;
  notes?: string;
  difficulty: number;
  mastery_level: number;
  last_reviewed_at?: string;
  next_review_at?: string;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  concept_id?: string;
  front: string;
  back: string;
  deck_name: string;
  difficulty: number;
  last_reviewed_at?: string;
  next_review_at?: string;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  subject_id?: string;
  topic_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  focus_score?: number;
  notes?: string;
  created_at: string;
}

export interface Review {
  id: string;
  concept_id?: string;
  flashcard_id?: string;
  rating: number;
  interval_days: number;
  ease_factor: number;
  reviewed_at: string;
}

export interface FeynmanNote {
  id: string;
  concept_id: string;
  version: number;
  explanation: string;
  gaps_identified?: string;
  simplified_explanation?: string;
  created_at: string;
}

export interface Connection {
  id: string;
  concept_id: string;
  type: 'analogy' | 'memory_aid' | 'curiosity' | 'personal_impact' | 'humor';
  content: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  scheduled_at: string;
  repeat_pattern?: string;
  enabled: boolean;
  notification_id?: string;
  created_at: string;
  updated_at: string;
}

// ==================== Subject Repository ====================
export const SubjectRepository = {
  getAll(): Subject[] {
    const db = getDatabase();
    return db.getAllSync<Subject>('SELECT * FROM subjects ORDER BY order_index, name');
  },

  getById(id: string): Subject | null {
    const db = getDatabase();
    return db.getFirstSync<Subject>('SELECT * FROM subjects WHERE id = ?', [id]) ?? null;
  },

  create(name: string, color?: string, icon?: string): Subject {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.runSync(
      'INSERT INTO subjects (id, name, color, icon, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, color ?? null, icon ?? null, 0, now, now]
    );
    
    return this.getById(id)!;
  },

  update(id: string, updates: Partial<Pick<Subject, 'name' | 'color' | 'icon' | 'order_index'>>): Subject | undefined {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updates.icon);
    }
    if (updates.order_index !== undefined) {
      fields.push('order_index = ?');
      values.push(updates.order_index);
    }
    
    if (fields.length === 0) return this.getById(id) ?? undefined;
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    db.runSync(`UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id) ?? undefined;
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM subjects WHERE id = ?', [id]);
  },
};

// ==================== Topic Repository ====================
export const TopicRepository = {
  getAll(subjectId?: string): Topic[] {
    const db = getDatabase();
    if (subjectId) {
      return db.getAllSync<Topic>('SELECT * FROM topics WHERE subject_id = ? ORDER BY order_index, name', [subjectId]);
    }
    return db.getAllSync<Topic>('SELECT * FROM topics ORDER BY order_index, name');
  },

  getById(id: string): Topic | null {
    const db = getDatabase();
    return db.getFirstSync<Topic>('SELECT * FROM topics WHERE id = ?', [id]) ?? null;
  },

  create(subjectId: string, name: string, description?: string): Topic {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.runSync(
      'INSERT INTO topics (id, subject_id, name, description, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, subjectId, name, description ?? null, 0, now, now]
    );
    
    return this.getById(id)!;
  },

  update(id: string, updates: Partial<Pick<Topic, 'name' | 'description' | 'order_index'>>): Topic | undefined {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.order_index !== undefined) {
      fields.push('order_index = ?');
      values.push(updates.order_index);
    }
    
    if (fields.length === 0) return this.getById(id) ?? undefined;
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    db.runSync(`UPDATE topics SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id) ?? undefined;
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM topics WHERE id = ?', [id]);
  },
};

// ==================== Concept Repository ====================
export const ConceptRepository = {
  getAll(topicId?: string): Concept[] {
    const db = getDatabase();
    if (topicId) {
      return db.getAllSync<Concept>('SELECT * FROM concepts WHERE topic_id = ? ORDER BY title', [topicId]);
    }
    return db.getAllSync<Concept>('SELECT * FROM concepts ORDER BY title');
  },

  getById(id: string): Concept | null {
    const db = getDatabase();
    return db.getFirstSync<Concept>('SELECT * FROM concepts WHERE id = ?', [id]) ?? null;
  },

  search(query: string): Concept[] {
    const db = getDatabase();
    return db.getAllSync<Concept>(
      `SELECT c.* FROM concepts c
       JOIN concepts_fts fts ON c.rowid = fts.rowid
       WHERE concepts_fts MATCH ?
       ORDER BY rank`,
      [query]
    );
  },

  create(topicId: string, title: string, data?: Partial<Concept>): Concept {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.runSync(
      `INSERT INTO concepts (id, topic_id, title, explanation, question, answer, notes, difficulty, mastery_level, 
         last_reviewed_at, next_review_at, review_count, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, topicId, title,
        data?.explanation ?? null,
        data?.question ?? null,
        data?.answer ?? null,
        data?.notes ?? null,
        data?.difficulty ?? 0.5,
        data?.mastery_level ?? 0,
        data?.last_reviewed_at ?? null,
        data?.next_review_at ?? null,
        data?.review_count ?? 0,
        now, now
      ]
    );
    
    return this.getById(id)!;
  },

  update(id: string, updates: Partial<Concept>): Concept | undefined {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];
    
    const updatableFields = ['title', 'explanation', 'question', 'answer', 'notes', 'difficulty', 'mastery_level', 'last_reviewed_at', 'next_review_at', 'review_count'];
    for (const field of updatableFields) {
      if (updates[field as keyof Concept] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field as keyof Concept]);
      }
    }
    
    values.push(id);
    db.runSync(`UPDATE concepts SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id) ?? undefined;
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM concepts WHERE id = ?', [id]);
  },
};

// ==================== Flashcard Repository ====================
export const FlashcardRepository = {
  getAll(deckName?: string): Flashcard[] {
    const db = getDatabase();
    if (deckName) {
      return db.getAllSync<Flashcard>('SELECT * FROM flashcards WHERE deck_name = ? ORDER BY front', [deckName]);
    }
    return db.getAllSync<Flashcard>('SELECT * FROM flashcards ORDER BY front');
  },

  getById(id: string): Flashcard | null {
    const db = getDatabase();
    return db.getFirstSync<Flashcard>('SELECT * FROM flashcards WHERE id = ?', [id]) ?? null;
  },

  getDueForReview(): Flashcard[] {
    const db = getDatabase();
    const now = new Date().toISOString();
    return db.getAllSync<Flashcard>(
      "SELECT * FROM flashcards WHERE next_review_at IS NULL OR next_review_at <= ?",
      [now]
    );
  },

  create(front: string, back: string, conceptId?: string, deckName?: string): Flashcard {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.runSync(
      'INSERT INTO flashcards (id, concept_id, front, back, deck_name, difficulty, review_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, conceptId ?? null, front, back, deckName ?? 'Default', 0.5, 0, now, now]
    );
    
    return this.getById(id)!;
  },

  update(id: string, updates: Partial<Flashcard>): Flashcard | undefined {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];
    
    const updatableFields = ['front', 'back', 'deck_name', 'difficulty', 'last_reviewed_at', 'next_review_at', 'review_count'];
    for (const field of updatableFields) {
      if (updates[field as keyof Flashcard] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field as keyof Flashcard]);
      }
    }
    
    values.push(id);
    db.runSync(`UPDATE flashcards SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id) ?? undefined;
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM flashcards WHERE id = ?', [id]);
  },
};

// ==================== Study Session Repository ====================
export const StudySessionRepository = {
  getAll(limit?: number): StudySession[] {
    const db = getDatabase();
    let query = 'SELECT * FROM study_sessions ORDER BY created_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    return db.getAllSync<StudySession>(query);
  },

  getById(id: string): StudySession | null {
    const db = getDatabase();
    return db.getFirstSync<StudySession>('SELECT * FROM study_sessions WHERE id = ?', [id]) ?? null;
  },

  getByDateRange(startDate: string, endDate: string): StudySession[] {
    const db = getDatabase();
    return db.getAllSync<StudySession>(
      'SELECT * FROM study_sessions WHERE date(start_time) >= date(?) AND date(start_time) <= date(?) ORDER BY start_time DESC',
      [startDate, endDate]
    );
  },

  getTodayBySubject(subjectId?: string): StudySession[] {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    
    if (subjectId) {
      return db.getAllSync<StudySession>(
        'SELECT * FROM study_sessions WHERE subject_id = ? AND date(start_time) = ? ORDER BY start_time DESC',
        [subjectId, today]
      );
    }
    
    return db.getAllSync<StudySession>(
      'SELECT * FROM study_sessions WHERE date(start_time) = ? ORDER BY start_time DESC',
      [today]
    );
  },

  getTotalStudyTimeDays(days: number): number {
    const db = getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = db.getFirstSync<{ total: number }>(
      'SELECT COALESCE(SUM(duration_seconds), 0) as total FROM study_sessions WHERE date(start_time) >= date(?)',
      [startDate.toISOString()]
    );
    return result?.total ?? 0;
  },

  create(data: Omit<StudySession, 'id' | 'created_at'>): StudySession {
    const db = getDatabase();
    const id = uuidv4();
    
    db.runSync(
      'INSERT INTO study_sessions (id, subject_id, topic_id, start_time, end_time, duration_seconds, focus_score, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.subject_id ?? null, data.topic_id ?? null, data.start_time, data.end_time ?? null, data.duration_seconds, data.focus_score ?? null, data.notes ?? null, new Date().toISOString()]
    );
    
    return this.getById(id)!;
  },

  update(id: string, updates: Partial<StudySession>): StudySession | undefined {
    const db = getDatabase();
    
    const fields: string[] = [];
    const values: any[] = [];
    
    const updatableFields = ['end_time', 'duration_seconds', 'focus_score', 'notes'];
    for (const field of updatableFields) {
      if (updates[field as keyof StudySession] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field as keyof StudySession]);
      }
    }
    
    if (fields.length === 0) return this.getById(id) ?? undefined;
    
    values.push(id);
    db.runSync(`UPDATE study_sessions SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id) ?? undefined;
  },

  getDailyStats(days: number): { date: string; duration_minutes: number }[] {
    const db = getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    
    const results = db.getAllSync<{ date: string; duration_minutes: number }>(
      `SELECT 
        date(start_time) as date,
        ROUND(COALESCE(SUM(duration_seconds), 0) / 60.0, 0) as duration_minutes
       FROM study_sessions 
       WHERE date(start_time) >= date(?)
       GROUP BY date(start_time)
       ORDER BY date ASC`,
      [startDate.toISOString()]
    );
    
    // Fill in missing days with 0
    const dailyData: { date: string; duration_minutes: number }[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const existing = results.find(r => r.date === dateStr);
      dailyData.push({
        date: dateStr,
        duration_minutes: existing?.duration_minutes ?? 0,
      });
    }
    
    return dailyData;
  },

  getBySubjectLastWeek(): { subject_id: string | null; subject_name: string | null; duration_minutes: number }[] {
    const db = getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    return db.getAllSync<{ subject_id: string | null; subject_name: string | null; duration_minutes: number }>(
      `SELECT 
        ss.subject_id,
        s.name as subject_name,
        ROUND(COALESCE(SUM(ss.duration_seconds), 0) / 60.0, 0) as duration_minutes
       FROM study_sessions ss
       LEFT JOIN subjects s ON ss.subject_id = s.id
       WHERE date(ss.start_time) >= date(?)
       GROUP BY ss.subject_id
       ORDER BY duration_minutes DESC`,
      [startDate.toISOString()]
    );
  },

  getCurrentStreak(): number {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's a session today
    const todaySession = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM study_sessions WHERE date(start_time) = ?',
      [today]
    );
    
    if (!todaySession || todaySession.count === 0) {
      // No session today, check streak ending yesterday
      const result = db.getFirstSync<{ streak: number }>(`
        WITH consecutive_days AS (
          SELECT 
            date(start_time) as study_date,
            julianday(date(start_time)) - julianday(
              (SELECT MAX(date(start_time)) FROM study_sessions WHERE date(start_time) < date(?))
            ) as day_diff
          FROM study_sessions
          WHERE date(start_time) <= date(?)
        )
        SELECT COUNT(*) as streak
        FROM (
          SELECT study_date
          FROM consecutive_days
          WHERE day_diff <= 1
          ORDER BY study_date DESC
          LIMIT 365
        )
      `, [today, today]);
      
      return result?.streak ?? 0;
    }
    
    // Count consecutive days including today
    const result = db.getFirstSync<{ streak: number }>(`
      WITH RECURSIVE dates AS (
        SELECT DISTINCT date(start_time) as study_date FROM study_sessions
      ),
      consecutive AS (
        SELECT 
          study_date,
          julianday(?) - julianday(study_date) as days_ago
        FROM dates
        WHERE days_ago >= 0 AND days_ago <= 365
      )
      SELECT COUNT(*) as streak
      FROM consecutive c1
      WHERE NOT EXISTS (
        SELECT 1 FROM consecutive c2 
        WHERE c2.days_ago = c1.days_ago - 1
      ) OR c1.days_ago = 0
    `, [today]);
    
    // Simplified approach: count consecutive days from today backwards
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasSession = db.getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM study_sessions WHERE date(start_time) = ?',
        [dateStr]
      );
      
      if (hasSession && hasSession.count > 0) {
        streak++;
      } else if (i > 0) {
        // Break if we find a gap (but allow no session on current day being checked)
        break;
      }
    }
    
    return streak;
  },
};

// ==================== Review Repository ====================
export const ReviewRepository = {
  getAll(conceptId?: string, limit?: number): Review[] {
    const db = getDatabase();
    let query = 'SELECT * FROM reviews';
    const params: any[] = [];
    
    if (conceptId) {
      query += ' WHERE concept_id = ?';
      params.push(conceptId);
    }
    
    query += ' ORDER BY reviewed_at DESC';
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    return db.getAllSync<Review>(query, params);
  },

  create(data: Omit<Review, 'id' | 'reviewed_at'>): Review {
    const db = getDatabase();
    const id = uuidv4();
    
    db.runSync(
      'INSERT INTO reviews (id, concept_id, flashcard_id, rating, interval_days, ease_factor, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.concept_id ?? null, data.flashcard_id ?? null, data.rating, data.interval_days, data.ease_factor, new Date().toISOString()]
    );
    
    const result = db.getFirstSync<Review>('SELECT * FROM reviews WHERE id = ?', [id]);
    return result!;
  },
};

// ==================== Feynman Note Repository ====================
export const FeynmanNoteRepository = {
  getByConceptId(conceptId: string): FeynmanNote[] {
    const db = getDatabase();
    return db.getAllSync<FeynmanNote>(
      'SELECT * FROM feynman_notes WHERE concept_id = ? ORDER BY version DESC',
      [conceptId]
    );
  },

  create(conceptId: string, explanation: string, gapsIdentified?: string, simplifiedExplanation?: string): FeynmanNote {
    const db = getDatabase();
    const id = uuidv4();
    
    // Get current max version
    const current = db.getFirstSync<{ max_version: number }>(
      'SELECT MAX(version) as max_version FROM feynman_notes WHERE concept_id = ?',
      [conceptId]
    );
    const version = (current?.max_version ?? 0) + 1;
    
    db.runSync(
      'INSERT INTO feynman_notes (id, concept_id, version, explanation, gaps_identified, simplified_explanation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, conceptId, version, explanation, gapsIdentified ?? null, simplifiedExplanation ?? null, new Date().toISOString()]
    );
    
    const result = db.getFirstSync<FeynmanNote>('SELECT * FROM feynman_notes WHERE id = ?', [id]);
    return result!;
  },
};

// ==================== Connection Repository ====================
export const ConnectionRepository = {
  getByConceptId(conceptId: string): Connection[] {
    const db = getDatabase();
    return db.getAllSync<Connection>(
      'SELECT * FROM connections WHERE concept_id = ? ORDER BY created_at DESC',
      [conceptId]
    );
  },

  create(conceptId: string, type: Connection['type'], content: string): Connection {
    const db = getDatabase();
    const id = uuidv4();
    
    db.runSync(
      'INSERT INTO connections (id, concept_id, type, content, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, conceptId, type, content, new Date().toISOString()]
    );
    
    const result = db.getFirstSync<Connection>('SELECT * FROM connections WHERE id = ?', [id]);
    return result!;
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM connections WHERE id = ?', [id]);
  },
};

// ==================== Reminder Repository ====================
export const ReminderRepository = {
  getAll(): Reminder[] {
    const db = getDatabase();
    return db.getAllSync<Reminder>('SELECT * FROM reminders ORDER BY scheduled_at');
  },

  getById(id: string): Reminder | null {
    const db = getDatabase();
    return db.getFirstSync<Reminder>('SELECT * FROM reminders WHERE id = ?', [id]) ?? null;
  },

  getEnabled(): Reminder[] {
    const db = getDatabase();
    return db.getAllSync<Reminder>('SELECT * FROM reminders WHERE enabled = 1 ORDER BY scheduled_at');
  },

  create(title: string, scheduledAt: string, repeatPattern?: string): Reminder {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.runSync(
      'INSERT INTO reminders (id, title, scheduled_at, repeat_pattern, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, scheduledAt, repeatPattern ?? null, 1, now, now]
    );
    
    return this.getById(id)!;
  },

  update(id: string, updates: Partial<Reminder>): Reminder | undefined {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [now];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.scheduled_at !== undefined) {
      fields.push('scheduled_at = ?');
      values.push(updates.scheduled_at);
    }
    if (updates.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(updates.enabled ? 1 : 0);
    }
    if (updates.notification_id !== undefined) {
      fields.push('notification_id = ?');
      values.push(updates.notification_id);
    }
    
    values.push(id);
    db.runSync(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id) ?? undefined;
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM reminders WHERE id = ?', [id]);
  },
};
