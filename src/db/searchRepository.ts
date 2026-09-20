/**
 * Repositório de Pesquisa Global - FTS5 (Full-Text Search)
 * Busca offline em todos os conteúdos usando SQLite FTS5
 */

import { getDatabase } from '../db';

export interface SearchResult {
  type: 'concept' | 'flashcard' | 'connection' | 'feynman';
  id: string;
  title: string;
  snippet: string;
  highlightedSnippet?: string;
  subjectName?: string;
  topicName?: string;
  matchScore?: number;
}

export interface SearchFilters {
  subjectId?: string;
  topicId?: string;
  types?: Array<'concept' | 'flashcard' | 'connection' | 'feynman'>;
  limit?: number;
}

/**
 * Realiza busca full-text em todo o conteúdo
 * Usa FTS5 do SQLite para busca eficiente offline
 */
export function search(query: string, filters?: SearchFilters): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const db = getDatabase();
  const results: SearchResult[] = [];
  const normalizedQuery = query.trim().toLowerCase();

  try {
    // Buscar em Conceitos (usando FTS5)
    if (!filters?.types || filters.types.includes('concept')) {
      const conceptQuery = `
        SELECT 
          c.id,
          c.title,
          c.explanation,
          c.question,
          c.answer,
          c.notes,
          s.name as subject_name,
          t.name as topic_name,
          bm25(concepts_fts) as match_score
        FROM concepts_fts fts
        JOIN concepts c ON c.rowid = fts.rowid
        LEFT JOIN topics t ON c.topic_id = t.id
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE concepts_fts MATCH ?
        ${filters?.subjectId ? 'AND t.subject_id = ?' : ''}
        ${filters?.topicId ? 'AND c.topic_id = ?' : ''}
        ORDER BY match_score ASC
        LIMIT ?
      `;

      const params: any[] = [normalizedQuery];
      if (filters?.subjectId) params.push(filters.subjectId);
      if (filters?.topicId) params.push(filters.topicId);
      params.push(filters?.limit || 20);

      const conceptRows = db.getAllSync<{
        id: string;
        title: string;
        explanation: string | null;
        question: string | null;
        answer: string | null;
        notes: string | null;
        subject_name: string | null;
        topic_name: string | null;
        match_score: number;
      }>(conceptQuery, params);

      for (const row of conceptRows) {
        const contentParts = [
          row.title,
          row.explanation,
          row.question,
          row.answer,
          row.notes,
        ].filter(Boolean) as string[];

        const snippet = generateSnippet(contentParts, normalizedQuery);
        const highlighted = highlightText(snippet, normalizedQuery);

        results.push({
          type: 'concept',
          id: row.id,
          title: row.title,
          snippet,
          highlightedSnippet: highlighted,
          subjectName: row.subject_name ?? undefined,
          topicName: row.topic_name ?? undefined,
          matchScore: -row.match_score,
        });
      }
    }

    // Buscar em Flashcards
    if (!filters?.types || filters.types.includes('flashcard')) {
      const flashcardQuery = `
        SELECT 
          f.id,
          f.front,
          f.back,
          f.deck_name,
          c.title as concept_title,
          s.name as subject_name
        FROM flashcards f
        LEFT JOIN concepts c ON f.concept_id = c.id
        LEFT JOIN topics t ON c.topic_id = t.id
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE 
          (f.front LIKE ? OR f.back LIKE ?)
          ${filters?.subjectId ? 'AND t.subject_id = ?' : ''}
        LIMIT ?
      `;

      const likeQuery = `%${normalizedQuery}%`;
      const params: any[] = [likeQuery, likeQuery];
      if (filters?.subjectId) params.push(filters.subjectId);
      params.push(filters?.limit || 20);

      const flashcardRows = db.getAllSync<{
        id: string;
        front: string;
        back: string;
        deck_name: string | null;
        concept_title: string | null;
        subject_name: string | null;
      }>(flashcardQuery, params);

      for (const row of flashcardRows) {
        const content = `${row.front} - ${row.back}`;
        const snippet = content.length > 150 ? content.substring(0, 150) + '...' : content;
        const highlighted = highlightText(snippet, normalizedQuery);

        results.push({
          type: 'flashcard',
          id: row.id,
          title: row.concept_title || row.deck_name || 'Flashcard',
          snippet,
          highlightedSnippet: highlighted,
          subjectName: row.subject_name ?? undefined,
        });
      }
    }

    // Buscar em Conexões
    if (!filters?.types || filters.types.includes('connection')) {
      const connectionQuery = `
        SELECT 
          conn.id,
          conn.type,
          conn.content,
          c.title as concept_title,
          s.name as subject_name
        FROM connections conn
        JOIN concepts c ON conn.concept_id = c.id
        LEFT JOIN topics t ON c.topic_id = t.id
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE conn.content LIKE ?
        ${filters?.subjectId ? 'AND t.subject_id = ?' : ''}
        LIMIT ?
      `;

      const likeQuery = `%${normalizedQuery}%`;
      const params: any[] = [likeQuery];
      if (filters?.subjectId) params.push(filters.subjectId);
      params.push(filters?.limit || 20);

      const connectionRows = db.getAllSync<{
        id: string;
        type: string;
        content: string;
        concept_title: string;
        subject_name: string | null;
      }>(connectionQuery, params);

      for (const row of connectionRows) {
        const snippet = row.content.length > 150 ? row.content.substring(0, 150) + '...' : row.content;
        const highlighted = highlightText(snippet, normalizedQuery);

        results.push({
          type: 'connection',
          id: row.id,
          title: `${row.type}: ${row.concept_title}`,
          snippet,
          highlightedSnippet: highlighted,
          subjectName: row.subject_name ?? undefined,
        });
      }
    }

    // Buscar em Notas Feynman
    if (!filters?.types || filters.types.includes('feynman')) {
      const feynmanQuery = `
        SELECT 
          fn.id,
          fn.explanation,
          fn.gaps_identified,
          c.title as concept_title,
          s.name as subject_name
        FROM feynman_notes fn
        JOIN concepts c ON fn.concept_id = c.id
        LEFT JOIN topics t ON c.topic_id = t.id
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE fn.explanation LIKE ? OR fn.gaps_identified LIKE ?
        ${filters?.subjectId ? 'AND t.subject_id = ?' : ''}
        ORDER BY fn.created_at DESC
        LIMIT ?
      `;

      const likeQuery = `%${normalizedQuery}%`;
      const params: any[] = [likeQuery, likeQuery];
      if (filters?.subjectId) params.push(filters.subjectId);
      params.push(filters?.limit || 20);

      const feynmanRows = db.getAllSync<{
        id: string;
        explanation: string;
        gaps_identified: string | null;
        concept_title: string;
        subject_name: string | null;
      }>(feynmanQuery, params);

      for (const row of feynmanRows) {
        const content = row.explanation;
        const snippet = content.length > 150 ? content.substring(0, 150) + '...' : content;
        const highlighted = highlightText(snippet, normalizedQuery);

        results.push({
          type: 'feynman',
          id: row.id,
          title: `Feynman: ${row.concept_title}`,
          snippet,
          highlightedSnippet: highlighted,
          subjectName: row.subject_name ?? undefined,
        });
      }
    }

    return results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

function generateSnippet(parts: string[], query: string, maxLength: number = 150): string {
  const fullText = parts.join(' ').trim();
  
  if (fullText.length <= maxLength) {
    return fullText;
  }

  const queryIndex = fullText.toLowerCase().indexOf(query);
  
  if (queryIndex !== -1) {
    const start = Math.max(0, queryIndex - 30);
    const end = Math.min(fullText.length, start + maxLength);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < fullText.length ? '...' : '';
    return prefix + fullText.substring(start, end) + suffix;
  }

  return fullText.substring(0, maxLength) + '...';
}

function highlightText(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '**$1**');
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getSuggestions(query: string, limit: number = 3): string[] {
  if (!query || query.length < 2) return [];

  const db = getDatabase();
  
  try {
    const suggestionQuery = `
      SELECT DISTINCT title
      FROM concepts
      WHERE title LIKE ?
      LIMIT ?
    `;

    const likeQuery = `%${query}%`;
    const rows = db.getAllSync<{ title: string }>(suggestionQuery, [likeQuery, limit]);
    
    return rows.map(r => r.title);
  } catch {
    return [];
  }
}

export function rebuildSearchIndex(): void {
  const db = getDatabase();
  
  try {
    db.execSync(`DELETE FROM concepts_fts`);
    db.execSync(`INSERT INTO concepts_fts(rowid, title, explanation, question, answer, notes)
      SELECT rowid, title, explanation, question, answer, notes FROM concepts`);
  } catch (error) {
    console.error('Error rebuilding search index:', error);
  }
}
