import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterSubjectsByDepartmentAndSemester,
  searchAcademicMaterials,
  calculateQuizScore,
  validateDriveMapping,
  extractDocumentKeyTerms,
} from './academic-logic.ts';
import type { Subject, StudyMaterial, QuizQuestion } from '../types/academic.ts';

test('filterSubjectsByDepartmentAndSemester returns only matching subjects', () => {
  const dummySubjects: Subject[] = [
    {
      id: 'sub-1',
      code: 'BIO101',
      name: 'Cell Biology & Genetics',
      departmentId: 'dept-biotech',
      semester: 1,
      credits: 4,
      facultyInCharge: 'Dr. Sunita Sharma',
      description: 'Foundations of cellular processes and genetics',
      units: [],
    },
    {
      id: 'sub-2',
      code: 'BIO102',
      name: 'Biotechnology Fundamentals',
      departmentId: 'dept-biotech',
      semester: 1,
      credits: 3,
      facultyInCharge: 'Dr. K. Rao',
      description: 'Intro to biotechnology',
      units: [],
    },
    {
      id: 'sub-3',
      code: 'CS101',
      name: 'C Programming',
      departmentId: 'dept-cs',
      semester: 1,
      credits: 4,
      facultyInCharge: 'Prof. Mehta',
      description: 'Core programming',
      units: [],
    },
    {
      id: 'sub-4',
      code: 'BIO201',
      name: 'Microbiology',
      departmentId: 'dept-biotech',
      semester: 2,
      credits: 4,
      facultyInCharge: 'Dr. Rao',
      description: 'Microbes and culture techniques',
      units: [],
    },
  ];

  const biotechSem1 = filterSubjectsByDepartmentAndSemester(dummySubjects, 'dept-biotech', 1);
  assert.equal(biotechSem1.length, 2);
  assert.equal(biotechSem1[0].code, 'BIO101');
  assert.equal(biotechSem1[1].code, 'BIO102');

  const csSem1 = filterSubjectsByDepartmentAndSemester(dummySubjects, 'dept-cs', 1);
  assert.equal(csSem1.length, 1);
  assert.equal(csSem1[0].code, 'CS101');

  const emptyResult = filterSubjectsByDepartmentAndSemester(dummySubjects, 'dept-cs', 3);
  assert.equal(emptyResult.length, 0);
});

test('searchAcademicMaterials accurately filters across title, tags, and content', () => {
  const dummyMaterials: StudyMaterial[] = [
    {
      id: 'mat-1',
      title: 'Cell Division Mitosis and Meiosis Notes',
      fileName: 'Unit1_CellDivision_FacultyNotes.pdf',
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: '3.4 MB',
      lastModified: '2026-10-12',
      facultyAuthor: 'Dr. Sunita Sharma',
      departmentId: 'dept-biotech',
      semester: 1,
      subjectId: 'sub-1',
      unitId: 'unit-1',
      syncStatus: 'synced',
      content: 'Mitosis results in two genetically identical daughter cells. Phases: Prophase, Metaphase, Anaphase, Telophase.',
      tags: ['Mitosis', 'Meiosis', 'Lecture Slides'],
      downloadCount: 42,
    },
    {
      id: 'mat-2',
      title: 'Binary Search Tree Traversals & Rotations',
      fileName: 'BST_AVL_Trees.pdf',
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: '2.8 MB',
      lastModified: '2026-10-14',
      facultyAuthor: 'Prof. Ramesh Gupta',
      departmentId: 'dept-cs',
      semester: 3,
      subjectId: 'sub-2',
      unitId: 'unit-2',
      syncStatus: 'synced',
      content: 'In-order traversal of a binary search tree yields keys in ascending sorted order. AVL trees maintain balance factor in {-1, 0, 1}.',
      tags: ['Trees', 'Algorithms', 'Exam Prep'],
      downloadCount: 88,
    },
  ];

  const queryTrees = searchAcademicMaterials(dummyMaterials, 'traversal');
  assert.equal(queryTrees.length, 1);
  assert.equal(queryTrees[0].id, 'mat-2');

  const queryFaculty = searchAcademicMaterials(dummyMaterials, 'Sunita');
  assert.equal(queryFaculty.length, 1);
  assert.equal(queryFaculty[0].id, 'mat-1');

  const queryTag = searchAcademicMaterials(dummyMaterials, 'Exam Prep');
  assert.equal(queryTag.length, 1);
  assert.equal(queryTag[0].id, 'mat-2');

  const emptySearch = searchAcademicMaterials(dummyMaterials, 'nonexistent query 123');
  assert.equal(emptySearch.length, 0);
});

test('calculateQuizScore evaluates MCQ, true/false, and short answers correctly', () => {
  const sampleQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'Which phase of mitosis aligns chromosomes along the equatorial plate?',
      type: 'mcq',
      options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
      correctAnswer: 1, // Metaphase
      explanation: 'Chromosomes align along the metaphase plate during metaphase.',
      difficulty: 'easy',
    },
    {
      id: 'q2',
      question: 'AVL trees guarantee O(log n) time complexity for search, insertion, and deletion.',
      type: 'true_false',
      correctAnswer: 'true',
      explanation: 'AVL trees are strictly height-balanced BSTs.',
      difficulty: 'medium',
    },
  ];

  // User gets both right
  const resultAllCorrect = calculateQuizScore(sampleQuestions, {
    q1: 1,
    q2: 'true',
  });
  assert.equal(resultAllCorrect.scorePercentage, 100);
  assert.equal(resultAllCorrect.correctCount, 2);
  assert.equal(resultAllCorrect.passed, true);
  assert.equal(resultAllCorrect.grade, 'A+');

  // User gets one wrong
  const resultHalf = calculateQuizScore(sampleQuestions, {
    q1: 0, // Prophase (wrong)
    q2: 'true',
  });
  assert.equal(resultHalf.scorePercentage, 50);
  assert.equal(resultHalf.correctCount, 1);
  assert.equal(resultHalf.wrongCount, 1);
  assert.equal(resultHalf.passed, true);
  assert.equal(resultHalf.grade, 'C');
});

test('validateDriveMapping checks all mandatory hierarchy properties', () => {
  const completeMapping = {
    departmentId: 'dept-biotech',
    semester: 1,
    subjectId: 'sub-1',
    unitId: 'unit-1',
  };
  const validCheck = validateDriveMapping(completeMapping);
  assert.equal(validCheck.isValid, true);
  assert.equal(validCheck.missingFields.length, 0);

  const incompleteMapping = {
    departmentId: 'dept-biotech',
    // missing semester, subjectId, unitId
  };
  const invalidCheck = validateDriveMapping(incompleteMapping);
  assert.equal(invalidCheck.isValid, false);
  assert.ok(invalidCheck.missingFields.includes('semester'));
  assert.ok(invalidCheck.missingFields.includes('subjectId'));
  assert.ok(invalidCheck.missingFields.includes('unitId'));
});

test('extractDocumentKeyTerms finds key capitalized terms and definitions', () => {
  const text = `
    Mitosis: The process in cell biology where chromosomes are separated into two nuclei.
    Centromere: The specialized DNA sequence of a chromosome that links a pair of sister chromatids.
    Chromatid: One of the two identical halves of a replicated chromosome.
    Cytokinesis: The cytoplasmic division of a cell at the end of mitosis.
  `;
  const terms = extractDocumentKeyTerms(text);
  assert.ok(terms.length >= 3);
  assert.ok(terms.includes('Mitosis'));
  assert.ok(terms.includes('Centromere'));
});
