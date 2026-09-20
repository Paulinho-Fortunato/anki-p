/**
 * Backup Service - Export/Import data as JSON
 * Uses expo-file-system for local file operations
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '@db/schema';
import {
  SubjectRepository,
  TopicRepository,
  ConceptRepository,
  FlashcardRepository,
  StudySessionRepository,
  ReviewRepository,
  FeynmanNoteRepository,
  ConnectionRepository,
  ReminderRepository,
} from '@db/repositories';

export interface BackupData {
  version: number;
  exportedAt: string;
  subjects: any[];
  topics: any[];
  concepts: any[];
  flashcards: any[];
  studySessions: any[];
  reviews: any[];
  feynmanNotes: any[];
  connections: any[];
  reminders: any[];
}

const BACKUP_VERSION = 1;
const BACKUP_DIR = `${FileSystem.documentDirectory}study_backups/`;

class BackupServiceClass {
  async ensureBackupDir(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    }
  }

  async exportData(): Promise<BackupData> {
    const db = getDatabase();

    const data: BackupData = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      subjects: db.getAllSync('SELECT * FROM subjects'),
      topics: db.getAllSync('SELECT * FROM topics'),
      concepts: db.getAllSync('SELECT * FROM concepts'),
      flashcards: db.getAllSync('SELECT * FROM flashcards'),
      studySessions: db.getAllSync('SELECT * FROM study_sessions'),
      reviews: db.getAllSync('SELECT * FROM reviews'),
      feynmanNotes: db.getAllSync('SELECT * FROM feynman_notes'),
      connections: db.getAllSync('SELECT * FROM connections'),
      reminders: db.getAllSync('SELECT * FROM reminders'),
    };

    return data;
  }

  async exportToFile(): Promise<string | null> {
    try {
      await this.ensureBackupDir();

      const data = await this.exportData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `study_backup_${timestamp}.json`;
      const filepath = `${BACKUP_DIR}${filename}`;

      await FileSystem.writeAsStringAsync(filepath, JSON.stringify(data, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file (opens system share sheet)
      await Sharing.shareAsync(filepath, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar Backup',
        UTI: 'public.json',
      });

      return filepath;
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }

  async importData(jsonString: string, options?: { merge: boolean }): Promise<{ success: boolean; error?: string }> {
    try {
      const data: BackupData = JSON.parse(jsonString);

      // Validate backup structure
      if (!this.validateBackup(data)) {
        return { success: false, error: 'Formato de backup inválido' };
      }

      const db = getDatabase();

      // If not merging, clear existing data first
      if (!options?.merge) {
        // Clear in reverse dependency order
        db.execSync('DELETE FROM connections');
        db.execSync('DELETE FROM feynman_notes');
        db.execSync('DELETE FROM reviews');
        db.execSync('DELETE FROM study_sessions');
        db.execSync('DELETE FROM flashcards');
        db.execSync('DELETE FROM concepts');
        db.execSync('DELETE FROM topics');
        db.execSync('DELETE FROM subjects');
        db.execSync('DELETE FROM reminders');
      }

      // Import in dependency order
      db.execSync('BEGIN TRANSACTION');

      try {
        // Import subjects
        for (const subject of data.subjects) {
          const exists = db.getFirstSync('SELECT id FROM subjects WHERE id = ?', [subject.id]);
          if (!exists) {
            db.runSync(
              'INSERT INTO subjects (id, name, color, icon, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [subject.id, subject.name, subject.color, subject.icon, subject.order_index, subject.created_at, subject.updated_at]
            );
          } else if (options?.merge) {
            db.runSync(
              'UPDATE subjects SET name = ?, color = ?, icon = ?, order_index = ?, updated_at = ? WHERE id = ?',
              [subject.name, subject.color, subject.icon, subject.order_index, subject.updated_at, subject.id]
            );
          }
        }

        // Import topics
        for (const topic of data.topics) {
          const exists = db.getFirstSync('SELECT id FROM topics WHERE id = ?', [topic.id]);
          if (!exists) {
            db.runSync(
              'INSERT INTO topics (id, subject_id, name, description, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [topic.id, topic.subject_id, topic.name, topic.description, topic.order_index, topic.created_at, topic.updated_at]
            );
          } else if (options?.merge) {
            db.runSync(
              'UPDATE topics SET subject_id = ?, name = ?, description = ?, order_index = ?, updated_at = ? WHERE id = ?',
              [topic.subject_id, topic.name, topic.description, topic.order_index, topic.updated_at, topic.id]
            );
          }
        }

        // Import concepts
        for (const concept of data.concepts) {
          const exists = db.getFirstSync('SELECT id FROM concepts WHERE id = ?', [concept.id]);
          if (!exists) {
            db.runSync(
              `INSERT INTO concepts (id, topic_id, title, explanation, question, answer, notes, difficulty, mastery_level, last_reviewed_at, next_review_at, review_count, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [concept.id, concept.topic_id, concept.title, concept.explanation, concept.question, concept.answer, concept.notes, concept.difficulty, concept.mastery_level, concept.last_reviewed_at, concept.next_review_at, concept.review_count, concept.created_at, concept.updated_at]
            );
          } else if (options?.merge) {
            db.runSync(
              `UPDATE concepts SET topic_id = ?, title = ?, explanation = ?, question = ?, answer = ?, notes = ?, difficulty = ?, mastery_level = ?, last_reviewed_at = ?, next_review_at = ?, review_count = ?, updated_at = ? WHERE id = ?`,
              [concept.topic_id, concept.title, concept.explanation, concept.question, concept.answer, concept.notes, concept.difficulty, concept.mastery_level, concept.last_reviewed_at, concept.next_review_at, concept.review_count, concept.updated_at, concept.id]
            );
          }
        }

        // Import flashcards
        for (const flashcard of data.flashcards) {
          const exists = db.getFirstSync('SELECT id FROM flashcards WHERE id = ?', [flashcard.id]);
          if (!exists) {
            db.runSync(
              'INSERT INTO flashcards (id, concept_id, front, back, deck_name, difficulty, last_reviewed_at, next_review_at, review_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [flashcard.id, flashcard.concept_id, flashcard.front, flashcard.back, flashcard.deck_name, flashcard.difficulty, flashcard.last_reviewed_at, flashcard.next_review_at, flashcard.review_count, flashcard.created_at, flashcard.updated_at]
            );
          } else if (options?.merge) {
            db.runSync(
              'UPDATE flashcards SET concept_id = ?, front = ?, back = ?, deck_name = ?, difficulty = ?, last_reviewed_at = ?, next_review_at = ?, review_count = ?, updated_at = ? WHERE id = ?',
              [flashcard.concept_id, flashcard.front, flashcard.back, flashcard.deck_name, flashcard.difficulty, flashcard.last_reviewed_at, flashcard.next_review_at, flashcard.review_count, flashcard.updated_at, flashcard.id]
            );
          }
        }

        // Import study sessions
        for (const session of data.studySessions) {
          db.runSync(
            'INSERT INTO study_sessions (id, subject_id, topic_id, start_time, end_time, duration_seconds, focus_score, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [session.id, session.subject_id, session.topic_id, session.start_time, session.end_time, session.duration_seconds, session.focus_score, session.notes, session.created_at]
          );
        }

        // Import reviews
        for (const review of data.reviews) {
          db.runSync(
            'INSERT INTO reviews (id, concept_id, flashcard_id, rating, interval_days, ease_factor, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [review.id, review.concept_id, review.flashcard_id, review.rating, review.interval_days, review.ease_factor, review.reviewed_at]
          );
        }

        // Import feynman notes
        for (const note of data.feynmanNotes) {
          db.runSync(
            'INSERT INTO feynman_notes (id, concept_id, version, explanation, gaps_identified, simplified_explanation, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [note.id, note.concept_id, note.version, note.explanation, note.gaps_identified, note.simplified_explanation, note.created_at]
          );
        }

        // Import connections
        for (const connection of data.connections) {
          db.runSync(
            'INSERT INTO connections (id, concept_id, type, content, created_at) VALUES (?, ?, ?, ?, ?)',
            [connection.id, connection.concept_id, connection.type, connection.content, connection.created_at]
          );
        }

        // Import reminders
        for (const reminder of data.reminders) {
          const exists = db.getFirstSync('SELECT id FROM reminders WHERE id = ?', [reminder.id]);
          if (!exists) {
            db.runSync(
              'INSERT INTO reminders (id, title, scheduled_at, repeat_pattern, enabled, notification_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [reminder.id, reminder.title, reminder.scheduled_at, reminder.repeat_pattern, reminder.enabled, reminder.notification_id, reminder.created_at, reminder.updated_at]
            );
          } else if (options?.merge) {
            db.runSync(
              'UPDATE reminders SET title = ?, scheduled_at = ?, repeat_pattern = ?, enabled = ?, notification_id = ?, updated_at = ? WHERE id = ?',
              [reminder.title, reminder.scheduled_at, reminder.repeat_pattern, reminder.enabled, reminder.notification_id, reminder.updated_at, reminder.id]
            );
          }
        }

        db.execSync('COMMIT');

        return { success: true };
      } catch (importError) {
        db.execSync('ROLLBACK');
        throw importError;
      }
    } catch (error) {
      console.error('Import failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Falha ao importar dados' 
      };
    }
  }

  async importFromFile(filepath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const jsonString = await FileSystem.readAsStringAsync(filepath, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return this.importData(jsonString);
    } catch (error) {
      return { success: false, error: 'Não foi possível ler o arquivo de backup' };
    }
  }

  private validateBackup(data: BackupData): boolean {
    return (
      data.version === BACKUP_VERSION &&
      Array.isArray(data.subjects) &&
      Array.isArray(data.topics) &&
      Array.isArray(data.concepts) &&
      typeof data.exportedAt === 'string'
    );
  }

  async getBackupFileSize(filepath: string): Promise<number> {
    const info = await FileSystem.getInfoAsync(filepath);
    if (!info.exists) return 0;
    return (info as any).size ?? 0;
  }

  async deleteOldBackups(daysToKeep: number = 30): Promise<void> {
    try {
      await this.ensureBackupDir();
      const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      for (const filename of files) {
        const filepath = `${BACKUP_DIR}${filename}`;
        const info = await FileSystem.getInfoAsync(filepath);
        
        if ((info as any).modificationTime && (info as any).modificationTime < cutoffDate) {
          await FileSystem.deleteAsync(filepath);
        }
      }
    } catch (error) {
      console.error('Failed to delete old backups:', error);
    }
  }
}

// Singleton instance
export const BackupService = new BackupServiceClass();
