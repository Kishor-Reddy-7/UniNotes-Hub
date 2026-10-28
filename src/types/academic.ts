/**
 * Types for the University Academic Notes Platform
 */

export type FileType = 'pdf' | 'doc' | 'slides' | 'sheet' | 'notes';

export interface StudyMaterial {
  id: string;
  title: string;
  fileName: string;
  fileType: FileType;
  mimeType: string;
  fileSize: string;
  lastModified: string;
  facultyAuthor: string;
  departmentId: string;
  semester: number;
  subjectId: string;
  unitId: string;
  driveFileId?: string;
  driveFolderId?: string;
  webViewLink?: string;
  webContentLink?: string;
  syncStatus: 'synced' | 'local_cached' | 'update_available' | 'permission_restricted';
  isRestricted?: boolean;
  restrictionReason?: string;
  content: string; // Real extracted document text for AI tools and reader
  tags: string[];
  downloadCount: number;
}

export interface Unit {
  id: string;
  subjectId: string;
  unitNumber: number;
  title: string;
  description: string;
  topics: string[];
  materialsCount?: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  semester: number;
  credits: number;
  facultyInCharge: string;
  description: string;
  units: Unit[];
}

export interface Department {
  id: string;
  name: string;
  shortCode: string;
  icon: string;
  totalSemesters: number;
  description: string;
}

export interface DriveFolderNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType?: string;
  mappedTo?: {
    departmentId?: string;
    semester?: number;
    subjectId?: string;
    unitId?: string;
  };
  children?: DriveFolderNode[];
  size?: string;
  lastModified?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'short';
  options?: string[];
  correctAnswer: string | number; // index for mcq or string
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PracticeQuestion {
  id: string;
  question: string;
  marks: number;
  topic: string;
  modelAnswer: string;
  keyPoints: string[];
}

export interface SyncLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  itemsAffected: number;
}
