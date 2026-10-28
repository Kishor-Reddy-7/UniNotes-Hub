export type UserRole = 'student' | 'faculty' | 'developer';
export type UserStatus = 'active' | 'pending_verification' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  facultyProfile?: {
    department: string;
    staffId: string;
    designation: string;
    qualification: string;
    reason: string;
  };
}

export interface FacultyVerificationRequest {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  department: string;
  staffId: string;
  designation: string;
  qualification: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface TopicItem {
  id: string;
  name: string;
}

export interface UnitItem {
  id: string;
  unitNumber: number;
  title: string;
  topics: TopicItem[];
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  credits?: number;
  units: UnitItem[];
}

export interface SemesterItem {
  semesterNumber: number;
  subjects: SubjectItem[];
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  semesters: SemesterItem[];
}

export type NoteImportance = 'core' | 'reference' | 'revision';
export type NoteFileType = 'pdf' | 'pptx' | 'docx' | 'image' | 'video';

export interface SlideContent {
  slideNumber: number;
  title: string;
  content: string;
  bulletPoints?: string[];
  notes?: string;
}

export interface DocxSection {
  heading: string;
  body: string;
}

export interface BioNote {
  id: string;
  catalogueNumber: string; // e.g. BIO-S1-CEL-U1-001
  title: string;
  description: string;
  departmentId: string;
  departmentName: string;
  semester: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  unitId: string;
  unitTitle: string;
  topicId?: string;
  topicName?: string;
  fileName: string;
  fileType: NoteFileType;
  fileSize: string;
  fileUrl: string; // data URL or local URL
  mimeType: string;
  tags: string[];
  importance: NoteImportance;
  summaryText?: string;
  extractedContent: string; // real text for in-app reader & AI study tools
  slides?: SlideContent[];
  docxSections?: DocxSection[];
  pagesCount?: number;
  authorId: string;
  authorEmail: string;
  authorName: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMessage {
  id: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderRole: UserRole;
  subject: string;
  message: string;
  attachmentName?: string;
  attachmentType?: NoteFileType | string;
  attachmentUrl?: string;
  attachmentSize?: string;
  department?: string;
  timestamp: string;
  replies?: {
    id: string;
    senderName: string;
    senderRole: UserRole;
    text: string;
    timestamp: string;
  }[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
}
