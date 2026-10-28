import type { Subject, StudyMaterial, QuizQuestion } from '../types/academic.ts';

/**
 * Filter subjects by department and semester
 */
export function filterSubjectsByDepartmentAndSemester(
  subjects: Subject[],
  departmentId: string,
  semester: number
): Subject[] {
  if (!departmentId || !semester) return [];
  return subjects.filter(
    (s) => s.departmentId === departmentId && s.semester === semester
  );
}

/**
 * Search academic materials by search query across title, tags, content, faculty author, and subject name
 */
export function searchAcademicMaterials(
  materials: StudyMaterial[],
  query: string,
  subjects: Subject[] = []
): StudyMaterial[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return materials;

  const subjectMap = new Map<string, string>();
  subjects.forEach((s) => {
    subjectMap.set(s.id, s.name.toLowerCase());
  });

  return materials.filter((material) => {
    if (material.title.toLowerCase().includes(normalized)) return true;
    if (material.fileName.toLowerCase().includes(normalized)) return true;
    if (material.facultyAuthor.toLowerCase().includes(normalized)) return true;
    if (material.tags.some((tag) => tag.toLowerCase().includes(normalized))) return true;
    
    // Check subject name if available
    const subjectName = subjectMap.get(material.subjectId);
    if (subjectName && subjectName.includes(normalized)) return true;

    // Check snippet of content
    if (material.content.toLowerCase().includes(normalized)) return true;

    return false;
  });
}

/**
 * Calculate Quiz Score and Review Results
 */
export interface QuizResultSummary {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  scorePercentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Review';
  passed: boolean;
  breakdown: {
    questionId: string;
    question: string;
    userAnswer: string | number | undefined;
    correctAnswer: string | number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export function calculateQuizScore(
  questions: QuizQuestion[],
  userAnswers: Record<string, string | number>
): QuizResultSummary {
  if (questions.length === 0) {
    return {
      totalQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      scorePercentage: 0,
      grade: 'Needs Review',
      passed: false,
      breakdown: [],
    };
  }

  let correctCount = 0;
  const breakdown = questions.map((q) => {
    const userAns = userAnswers[q.id];
    let isCorrect = false;

    if (q.type === 'mcq') {
      isCorrect = Number(userAns) === Number(q.correctAnswer);
    } else if (q.type === 'true_false') {
      isCorrect = String(userAns).toLowerCase() === String(q.correctAnswer).toLowerCase();
    } else {
      // short answer loose match
      const uStr = String(userAns || '').trim().toLowerCase();
      const cStr = String(q.correctAnswer).trim().toLowerCase();
      isCorrect = uStr.length > 0 && (uStr === cStr || cStr.includes(uStr) || uStr.includes(cStr));
    }

    if (isCorrect) correctCount++;

    return {
      questionId: q.id,
      question: q.question,
      userAnswer: userAns,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const totalQuestions = questions.length;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  let grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Review' = 'Needs Review';
  if (scorePercentage >= 90) grade = 'A+';
  else if (scorePercentage >= 75) grade = 'A';
  else if (scorePercentage >= 60) grade = 'B';
  else if (scorePercentage >= 40) grade = 'C';

  return {
    totalQuestions,
    correctCount,
    wrongCount: totalQuestions - correctCount,
    scorePercentage,
    grade,
    passed: scorePercentage >= 50,
    breakdown,
  };
}

/**
 * Validate that a Drive item mapping contains required hierarchy keys
 */
export function validateDriveMapping(mapping: {
  departmentId?: string;
  semester?: number;
  subjectId?: string;
  unitId?: string;
}): { isValid: boolean; missingFields: string[] } {
  const missing: string[] = [];
  if (!mapping.departmentId) missing.push('departmentId');
  if (!mapping.semester || mapping.semester < 1 || mapping.semester > 8) missing.push('semester');
  if (!mapping.subjectId) missing.push('subjectId');
  if (!mapping.unitId) missing.push('unitId');

  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
}

/**
 * Extract key academic terms / phrases from text
 */
export function extractDocumentKeyTerms(content: string, maxTerms = 6): string[] {
  if (!content) return [];
  // Look for bolded terms, capitalized terms or definitions
  const defMatches = content.match(/(?:[A-Z][A-Za-z0-9\s-]{2,25}):/g);
  const terms = new Set<string>();

  if (defMatches) {
    defMatches.forEach((m) => {
      const cleaned = m.replace(':', '').trim();
      if (cleaned.length > 3 && !terms.has(cleaned)) {
        terms.add(cleaned);
      }
    });
  }

  // Common stop words to exclude
  const stopWords = new Set(['the', 'and', 'with', 'from', 'this', 'that', 'were', 'which', 'note', 'unit', 'chapter', 'overview', 'summary']);
  const words = content.split(/[\s,.;:()]+/);
  for (const word of words) {
    if (terms.size >= maxTerms) break;
    const cleanWord = word.trim();
    if (
      cleanWord.length > 5 &&
      /^[A-Z][a-z]+$/.test(cleanWord) &&
      !stopWords.has(cleanWord.toLowerCase())
    ) {
      terms.add(cleanWord);
    }
  }

  return Array.from(terms).slice(0, maxTerms);
}
