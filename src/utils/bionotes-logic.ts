import { BioNote, NoteFileType, NoteImportance, DepartmentItem } from '../types/bionotes';

/**
 * Filter BioNotes by multi-dimensional catalogue criteria
 */
export interface CatalogueFilters {
  searchQuery?: string;
  departmentId?: string;
  semester?: number;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  fileType?: NoteFileType | 'all';
  importance?: NoteImportance | 'all';
}

export function filterBioNotes(notes: BioNote[], filters: CatalogueFilters): BioNote[] {
  const query = (filters.searchQuery || '').trim().toLowerCase();

  return notes.filter((note) => {
    // 1. Text Search across Title, Description, Tags, Subject, Author, Catalogue Number, and Extracted Text
    if (query) {
      const matchTitle = note.title.toLowerCase().includes(query);
      const matchDesc = note.description.toLowerCase().includes(query);
      const matchCat = note.catalogueNumber.toLowerCase().includes(query);
      const matchSubject = note.subjectName.toLowerCase().includes(query) || note.subjectCode.toLowerCase().includes(query);
      const matchAuthor = note.authorName.toLowerCase().includes(query);
      const matchTags = note.tags.some((t) => t.toLowerCase().includes(query));
      const matchContent = (note.extractedContent || '').toLowerCase().includes(query);

      if (!matchTitle && !matchDesc && !matchCat && !matchSubject && !matchAuthor && !matchTags && !matchContent) {
        return false;
      }
    }

    // 2. Department Filter
    if (filters.departmentId && filters.departmentId !== 'all') {
      if (note.departmentId !== filters.departmentId) return false;
    }

    // 3. Semester Filter
    if (filters.semester && filters.semester !== 0) {
      if (Number(note.semester) !== Number(filters.semester)) return false;
    }

    // 4. Subject Filter
    if (filters.subjectId && filters.subjectId !== 'all') {
      if (note.subjectId !== filters.subjectId) return false;
    }

    // 5. Unit Filter
    if (filters.unitId && filters.unitId !== 'all') {
      if (note.unitId !== filters.unitId) return false;
    }

    // 6. Topic Filter
    if (filters.topicId && filters.topicId !== 'all') {
      if (note.topicId !== filters.topicId) return false;
    }

    // 7. File Type Filter
    if (filters.fileType && filters.fileType !== 'all') {
      if (note.fileType !== filters.fileType) return false;
    }

    // 8. Importance Filter
    if (filters.importance && filters.importance !== 'all') {
      if (note.importance !== filters.importance) return false;
    }

    return true;
  });
}

/**
 * Generate standard academic catalogue index number
 * Format: {DEPT_CODE}-S{SEM}-{SUB_CODE}-U{UNIT}-{SEQ}
 */
export function generateCatalogueNumber(
  deptCode: string,
  semester: number,
  subjectCode: string,
  unitNumber: number,
  existingCount: number
): string {
  const cleanDept = (deptCode || 'BIO').replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
  const cleanSub = (subjectCode || 'GEN').replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
  const seq = String(existingCount + 1).padStart(3, '0');
  return `${cleanDept}-S${semester}-${cleanSub}-U${unitNumber}-${seq}`;
}

/**
 * Find or add hierarchy node for the "New shelf" feature
 */
export function addShelfToHierarchy(
  hierarchy: DepartmentItem[],
  target: {
    departmentId: string;
    semester: number;
    subjectName: string;
    subjectCode: string;
    unitTitle: string;
    unitNumber: number;
    topicName?: string;
  }
): DepartmentItem[] {
  return hierarchy.map((dept) => {
    if (dept.id !== target.departmentId) return dept;

    const semesters = [...dept.semesters];
    let sem = semesters.find((s) => s.semesterNumber === target.semester);
    if (!sem) {
      sem = { semesterNumber: target.semester, subjects: [] };
      semesters.push(sem);
      semesters.sort((a, b) => a.semesterNumber - b.semesterNumber);
    }

    const subjects = [...sem.subjects];
    let subject = subjects.find(
      (s) => s.code.toLowerCase() === target.subjectCode.toLowerCase() || s.name.toLowerCase() === target.subjectName.toLowerCase()
    );

    if (!subject) {
      subject = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: target.subjectName,
        code: target.subjectCode.toUpperCase(),
        units: [],
      };
      subjects.push(subject);
    }

    const units = [...subject.units];
    let unit = units.find(
      (u) => u.unitNumber === target.unitNumber || u.title.toLowerCase() === target.unitTitle.toLowerCase()
    );

    if (!unit) {
      unit = {
        id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        unitNumber: target.unitNumber,
        title: target.unitTitle,
        topics: [],
      };
      units.push(unit);
      units.sort((a, b) => a.unitNumber - b.unitNumber);
    }

    if (target.topicName && target.topicName.trim()) {
      const topicExists = unit.topics.some(
        (t) => t.name.toLowerCase() === target.topicName!.trim().toLowerCase()
      );
      if (!topicExists) {
        unit.topics.push({
          id: `top-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: target.topicName.trim(),
        });
      }
    }

    subject.units = units;
    sem.subjects = subjects;
    return { ...dept, semesters };
  });
}
