/**
 * Testes unitários para Repositórios (Database Layer)
 */

import { 
  SubjectRepository, 
  TopicRepository, 
  ConceptRepository,
  FlashcardRepository 
} from '../src/db/repositories';

describe('Repository Layer - Database Operations', () => {
  beforeAll(async () => {
    // Setup inicial se necessário
  });

  afterAll(async () => {
    // Cleanup se necessário
  });

  describe('SubjectRepository', () => {
    it('deve estar exportado corretamente', () => {
      expect(SubjectRepository).toBeDefined();
      expect(typeof SubjectRepository.getAll).toBe('function');
      expect(typeof SubjectRepository.getById).toBe('function');
      expect(typeof SubjectRepository.create).toBe('function');
      expect(typeof SubjectRepository.update).toBe('function');
      expect(typeof SubjectRepository.delete).toBe('function');
    });
  });

  describe('TopicRepository', () => {
    it('deve estar exportado corretamente', () => {
      expect(TopicRepository).toBeDefined();
      expect(typeof TopicRepository.getAll).toBe('function');
      expect(typeof TopicRepository.create).toBe('function');
      expect(typeof TopicRepository.update).toBe('function');
      expect(typeof TopicRepository.delete).toBe('function');
    });
  });

  describe('ConceptRepository', () => {
    it('deve estar exportado corretamente', () => {
      expect(ConceptRepository).toBeDefined();
      expect(typeof ConceptRepository.getAll).toBe('function');
      expect(typeof ConceptRepository.create).toBe('function');
      expect(typeof ConceptRepository.update).toBe('function');
      expect(typeof ConceptRepository.delete).toBe('function');
    });
  });

  describe('FlashcardRepository', () => {
    it('deve estar exportado corretamente', () => {
      expect(FlashcardRepository).toBeDefined();
      expect(typeof FlashcardRepository.getAll).toBe('function');
      expect(typeof FlashcardRepository.create).toBe('function');
      expect(typeof FlashcardRepository.update).toBe('function');
      expect(typeof FlashcardRepository.delete).toBe('function');
    });
  });

  describe('Integridade dos Repositórios', () => {
    it('todos os repositórios devem ter métodos CRUD básicos', () => {
      const repositories = [
        SubjectRepository,
        TopicRepository,
        ConceptRepository,
        FlashcardRepository,
      ];

      const crudMethods = ['create', 'update', 'delete'];

      repositories.forEach(repo => {
        crudMethods.forEach(method => {
          expect(repo).toHaveProperty(method);
          expect(typeof repo[method]).toBe('function');
        });
      });
    });

    it('todos os repositórios devem ter método getAll', () => {
      const repositories = [
        SubjectRepository,
        TopicRepository,
        ConceptRepository,
        FlashcardRepository,
      ];

      repositories.forEach(repo => {
        expect(repo.getAll).toBeDefined();
        expect(typeof repo.getAll).toBe('function');
      });
    });

    it('SubjectRepository deve ter getById', () => {
      expect(SubjectRepository.getById).toBeDefined();
      expect(typeof SubjectRepository.getById).toBe('function');
    });
  });
});
