import test from 'node:test';
import assert from 'node:assert/strict';
import { filterBioNotes, generateCatalogueNumber, addShelfToHierarchy } from './bionotes-logic.ts';
import { BioNote, DepartmentItem } from '../types/bionotes.ts';

const mockNotes: BioNote[] = [
  {
    id: 'note-1',
    catalogueNumber: 'BIO-S1-CEL-U1-001',
    title: 'Cell Division: Mitosis and Meiosis Dynamics',
    description: 'Comprehensive lecture slides covering mitotic stages.',
    departmentId: 'dept-biotech',
    departmentName: 'Biotechnology & Bioinformatics',
    semester: 1,
    subjectId: 'sub-bio-101',
    subjectCode: 'BIO101',
    subjectName: 'Cell Biology & Genetics',
    unitId: 'unit-bio-101-u1',
    unitTitle: 'Unit 1: Cellular Architecture & Cell Cycle',
    topicId: 'top-101-1',
    topicName: 'Mitosis Phases & Cytokinesis',
    fileName: 'Lecture_Mitosis_Meiosis.pptx',
    fileType: 'pptx',
    fileSize: '14.2 MB',
    fileUrl: 'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,demo',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    tags: ['Mitosis', 'Meiosis', 'Chromosomes'],
    importance: 'core',
    extractedContent: 'Prophase, Metaphase, Anaphase, Telophase. Spindle fibers attach to kinetochores.',
    authorId: 'usr-fac-1',
    authorEmail: 'dr.sunita@biouniversity.edu',
    authorName: 'Dr. Sunita Sharma',
    viewCount: 142,
    downloadCount: 78,
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
  },
  {
    id: 'note-2',
    catalogueNumber: 'BIO-S1-CEL-U2-001',
    title: 'Mendelian Genetics & Non-Mendelian Extensions',
    description: 'Foundational laws of segregation and independent assortment.',
    departmentId: 'dept-biotech',
    departmentName: 'Biotechnology & Bioinformatics',
    semester: 1,
    subjectId: 'sub-bio-101',
    subjectCode: 'BIO101',
    subjectName: 'Cell Biology & Genetics',
    unitId: 'unit-bio-101-u2',
    unitTitle: 'Unit 2: Mendelian & Molecular Genetics',
    topicId: 'top-101-3',
    topicName: 'Mendelian Inheritance Ratios',
    fileName: 'Genetics_Mendel_Handbook.pdf',
    fileType: 'pdf',
    fileSize: '8.7 MB',
    fileUrl: 'data:application/pdf;base64,demo',
    mimeType: 'application/pdf',
    tags: ['Mendel', 'Alleles', 'Punnett'],
    importance: 'reference',
    extractedContent: 'Law of Segregation states alleles separate during gamete formation. Monohybrid cross 3:1 ratio.',
    authorId: 'usr-fac-1',
    authorEmail: 'dr.sunita@biouniversity.edu',
    authorName: 'Dr. Sunita Sharma',
    viewCount: 89,
    downloadCount: 41,
    createdAt: '2026-10-18',
    updatedAt: '2026-10-18',
  },
  {
    id: 'note-3',
    catalogueNumber: 'BIO-S1-FBT-U1-001',
    title: 'Upstream Bioprocess and Fermenter Design',
    description: 'Technical reference for stirred tank bioreactors.',
    departmentId: 'dept-biotech',
    departmentName: 'Biotechnology & Bioinformatics',
    semester: 1,
    subjectId: 'sub-bio-102',
    subjectCode: 'BIO102',
    subjectName: 'Fundamentals of Biotechnology',
    unitId: 'unit-bio-102-u1',
    unitTitle: 'Unit 1: Introduction to Bioprocess Engineering',
    fileName: 'Bioreactor_Design_Manual.docx',
    fileType: 'docx',
    fileSize: '5.1 MB',
    fileUrl: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,demo',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    tags: ['Bioreactor', 'Fermentation'],
    importance: 'revision',
    extractedContent: 'Stirred tank bioreactors are the industry workhorse for microbial cultivation.',
    authorId: 'usr-fac-2',
    authorEmail: 'prof.nambiar@biouniversity.edu',
    authorName: 'Prof. K. Nambiar',
    viewCount: 65,
    downloadCount: 30,
    createdAt: '2026-10-20',
    updatedAt: '2026-10-20',
  },
];

test('filterBioNotes searches across title, tags, content, and author', () => {
  const qSpindle = filterBioNotes(mockNotes, { searchQuery: 'kinetochores' });
  assert.equal(qSpindle.length, 1);
  assert.equal(qSpindle[0].id, 'note-1');

  const qMendel = filterBioNotes(mockNotes, { searchQuery: 'Mendel' });
  assert.equal(qMendel.length, 1);
  assert.equal(qMendel[0].id, 'note-2');

  const qNambiar = filterBioNotes(mockNotes, { searchQuery: 'Nambiar' });
  assert.equal(qNambiar.length, 1);
  assert.equal(qNambiar[0].id, 'note-3');
});

test('filterBioNotes filters by importance and fileType', () => {
  const coreOnly = filterBioNotes(mockNotes, { importance: 'core' });
  assert.equal(coreOnly.length, 1);
  assert.equal(coreOnly[0].id, 'note-1');

  const pdfsOnly = filterBioNotes(mockNotes, { fileType: 'pdf' });
  assert.equal(pdfsOnly.length, 1);
  assert.equal(pdfsOnly[0].id, 'note-2');

  const pptxOnly = filterBioNotes(mockNotes, { fileType: 'pptx' });
  assert.equal(pptxOnly.length, 1);
  assert.equal(pptxOnly[0].id, 'note-1');
});

test('generateCatalogueNumber creates uniform standard catalogue identifiers', () => {
  const cat = generateCatalogueNumber('BIOTECH', 1, 'BIO101', 1, 0);
  assert.equal(cat, 'BIOT-S1-BIO1-U1-001');

  const cat2 = generateCatalogueNumber('CS', 3, 'CS302', 2, 5);
  assert.equal(cat2, 'CS-S3-CS30-U2-006');
});

test('addShelfToHierarchy correctly inserts new shelf levels without duplicates', () => {
  const baseHierarchy: DepartmentItem[] = [
    {
      id: 'dept-biotech',
      name: 'Biotechnology & Bioinformatics',
      code: 'BIO',
      semesters: [
        {
          semesterNumber: 1,
          subjects: [
            {
              id: 'sub-bio-101',
              name: 'Cell Biology & Genetics',
              code: 'BIO101',
              units: [
                {
                  id: 'unit-bio-101-u1',
                  unitNumber: 1,
                  title: 'Unit 1: Cellular Architecture & Cell Cycle',
                  topics: [{ id: 'top-1', name: 'Mitosis' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  // Add a new topic to existing unit
  const updated = addShelfToHierarchy(baseHierarchy, {
    departmentId: 'dept-biotech',
    semester: 1,
    subjectCode: 'BIO101',
    subjectName: 'Cell Biology & Genetics',
    unitNumber: 1,
    unitTitle: 'Unit 1: Cellular Architecture & Cell Cycle',
    topicName: 'Meiosis and Crossing Over',
  });

  const sem1 = updated[0].semesters.find((s) => s.semesterNumber === 1);
  const sub = sem1?.subjects.find((s) => s.code === 'BIO101');
  const unit = sub?.units.find((u) => u.unitNumber === 1);

  assert.equal(unit?.topics.length, 2);
  assert.equal(unit?.topics[1].name, 'Meiosis and Crossing Over');
});
