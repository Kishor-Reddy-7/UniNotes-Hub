import React, { useState, useMemo } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Presentation, 
  FileCode, 
  Image as ImageIcon, 
  Video, 
  FolderPlus, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  BookOpen, 
  Layers, 
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { DepartmentItem, NoteFileType, NoteImportance, User, BioNote } from '../types/bionotes';
import { generateCatalogueNumber, addShelfToHierarchy } from '../utils/bionotes-logic';

interface FacultyUploadModalProps {
  currentUser: User;
  hierarchy: DepartmentItem[];
  existingNotesCount: number;
  onClose: () => void;
  onUploadSuccess: (newNote: BioNote, updatedHierarchy?: DepartmentItem[]) => void;
}

export const FacultyUploadModal: React.FC<FacultyUploadModalProps> = ({
  currentUser,
  hierarchy,
  existingNotesCount,
  onClose,
  onUploadSuccess,
}) => {
  // Hierarchy selections
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    currentUser.facultyProfile?.department 
      ? hierarchy.find((d) => d.name.toLowerCase().includes(currentUser.facultyProfile!.department.toLowerCase()))?.id || hierarchy[0]?.id || ''
      : hierarchy[0]?.id || ''
  );
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  // Note fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [importance, setImportance] = useState<NoteImportance>('core');
  const [summaryText, setSummaryText] = useState('');

  // Real File state (Max 100 MB)
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileType, setFileType] = useState<NoteFileType>('pdf');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);

  // "New shelf" inline creation modal
  const [showNewShelfModal, setShowNewShelfModal] = useState(false);
  const [shelfDeptId, setShelfDeptId] = useState<string>(hierarchy[0]?.id || '');
  const [shelfSemester, setShelfSemester] = useState<number>(1);
  const [shelfSubjectName, setShelfSubjectName] = useState('');
  const [shelfSubjectCode, setShelfSubjectCode] = useState('');
  const [shelfUnitNumber, setShelfUnitNumber] = useState<number>(1);
  const [shelfUnitTitle, setShelfUnitTitle] = useState('');
  const [shelfTopicName, setShelfTopicName] = useState('');
  const [shelfMsg, setShelfMsg] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derived lists
  const currentDept = useMemo(() => hierarchy.find((d) => d.id === selectedDeptId), [hierarchy, selectedDeptId]);

  const availableSubjects = useMemo(() => {
    if (!currentDept) return [];
    const sem = currentDept.semesters.find((s) => s.semesterNumber === selectedSemester);
    return sem ? sem.subjects : [];
  }, [currentDept, selectedSemester]);

  const currentSubject = useMemo(
    () => availableSubjects.find((s) => s.id === selectedSubjectId),
    [availableSubjects, selectedSubjectId]
  );

  const availableUnits = useMemo(() => {
    return currentSubject ? currentSubject.units : [];
  }, [currentSubject]);

  const currentUnit = useMemo(
    () => availableUnits.find((u) => u.id === selectedUnitId),
    [availableUnits, selectedUnitId]
  );

  const availableTopics = useMemo(() => {
    return currentUnit ? currentUnit.topics : [];
  }, [currentUnit]);

  // Set default subject and unit when dept or sem changes
  React.useEffect(() => {
    if (availableSubjects.length > 0) {
      if (!availableSubjects.some((s) => s.id === selectedSubjectId)) {
        setSelectedSubjectId(availableSubjects[0].id);
      }
    } else {
      setSelectedSubjectId('');
    }
  }, [availableSubjects]);

  React.useEffect(() => {
    if (availableUnits.length > 0) {
      if (!availableUnits.some((u) => u.id === selectedUnitId)) {
        setSelectedUnitId(availableUnits[0].id);
      }
    } else {
      setSelectedUnitId('');
    }
  }, [availableUnits]);

  // Handle File Selection (Validate <= 100MB and detect real type)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Check size limit: 100 MB = 100 * 1024 * 1024 bytes
    const maxBytes = 100 * 1024 * 1024;
    if (selected.size > maxBytes) {
      setFileError('File exceeds the 100 MB limit. Please select a smaller file.');
      return;
    }

    setFile(selected);

    // Format human-readable size
    const sizeInMB = (selected.size / (1024 * 1024)).toFixed(1);
    const sizeStr = selected.size >= 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(selected.size / 1024)} KB`;
    setFileSizeStr(sizeStr);

    // Detect file type
    const name = selected.name.toLowerCase();
    let detectedType: NoteFileType = 'pdf';
    if (name.endsWith('.pptx') || name.endsWith('.ppt')) detectedType = 'pptx';
    else if (name.endsWith('.docx') || name.endsWith('.doc')) detectedType = 'docx';
    else if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp') || name.endsWith('.svg')) detectedType = 'image';
    else if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov')) detectedType = 'video';
    else if (name.endsWith('.pdf')) detectedType = 'pdf';
    setFileType(detectedType);

    // Default title from file name if empty
    if (!title) {
      const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }

    // Read as Base64 Data URL
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setFileError('Could not read the selected file.');
    };
    reader.readAsDataURL(selected);
  };

  // Handle "New shelf" creation
  const handleCreateNewShelf = async (e: React.FormEvent) => {
    e.preventDefault();
    setShelfMsg(null);

    if (!shelfSubjectName.trim() || !shelfSubjectCode.trim() || !shelfUnitTitle.trim()) {
      setShelfMsg('Please provide subject name, code, and unit title.');
      return;
    }

    try {
      const res = await fetch('/api/bionotes/hierarchy/shelf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: shelfDeptId,
          semester: shelfSemester,
          subjectName: shelfSubjectName.trim(),
          subjectCode: shelfSubjectCode.trim(),
          unitNumber: Number(shelfUnitNumber) || 1,
          unitTitle: shelfUnitTitle.trim(),
          topicName: shelfTopicName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create shelf');

      // Update current hierarchy in view and select newly created items
      setSelectedDeptId(shelfDeptId);
      setSelectedSemester(shelfSemester);
      setShowNewShelfModal(false);
      setShelfMsg(null);
    } catch (err: any) {
      setShelfMsg(err.message || 'Error creating shelf.');
    }
  };

  // Submit Note Upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Note title is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Description is required.');
      return;
    }
    if (!selectedDeptId || !selectedSubjectId || !selectedUnitId) {
      setErrorMsg('Please select Department, Semester, Subject, and Unit.');
      return;
    }
    if (!file && !fileBase64) {
      setErrorMsg('Please attach a valid file (PDF, PPTX, DOCX, Image, or Video).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Tags array
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Current subject and unit details
      const dept = hierarchy.find((d) => d.id === selectedDeptId);
      const sem = dept?.semesters.find((s) => s.semesterNumber === selectedSemester);
      const sub = sem?.subjects.find((s) => s.id === selectedSubjectId);
      const unit = sub?.units.find((u) => u.id === selectedUnitId);
      const topic = unit?.topics.find((t) => t.id === selectedTopicId);

      // Generate catalogue code
      const catCode = generateCatalogueNumber(
        dept?.code || 'BIO',
        selectedSemester,
        sub?.code || 'GEN',
        unit?.unitNumber || 1,
        existingNotesCount
      );

      const payload = {
        catalogueNumber: catCode,
        title: title.trim(),
        description: description.trim(),
        departmentId: selectedDeptId,
        departmentName: dept?.name || 'Department',
        semester: selectedSemester,
        subjectId: selectedSubjectId,
        subjectCode: sub?.code || 'BIO',
        subjectName: sub?.name || 'Subject',
        unitId: selectedUnitId,
        unitTitle: unit ? `Unit ${unit.unitNumber}: ${unit.title}` : 'Unit 1',
        topicId: selectedTopicId || undefined,
        topicName: topic?.name || undefined,
        fileName: file ? file.name : 'Faculty_Note.pdf',
        fileType: fileType,
        fileSize: fileSizeStr || '3.5 MB',
        fileUrl: fileBase64 || 'data:application/pdf;base64,placeholder',
        mimeType: file ? file.type : 'application/pdf',
        tags: tags.length > 0 ? tags : ['FacultyNotes', 'Curriculum'],
        importance: importance,
        summaryText: summaryText.trim() || undefined,
        extractedContent:
          summaryText.trim() ||
          `${title}. ${description}. Detailed syllabus lecture materials compiled by faculty ${currentUser.name}.`,
        authorId: currentUser.id,
        authorEmail: currentUser.email,
        authorName: currentUser.name,
      };

      const res = await fetch('/api/bionotes/notes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onUploadSuccess(data.note);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-[var(--bg-paper)] w-full max-w-3xl rounded-2xl border border-[var(--border-paper)] shadow-2xl overflow-hidden text-[var(--text-ink)] my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-paper)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-ink)] text-white flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[var(--text-ink)]">
                Publish Faculty Notes & Study Materials
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-catalogue-mono">
                Author: {currentUser.name} ({currentUser.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-paper)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real File Upload Dropzone (Max 100 MB) */}
          <div>
            <label className="block text-xs font-catalogue-mono uppercase text-[var(--text-muted)] mb-2">
              Academic File (Real Private Document • Max 100 MB) *
            </label>
            <div className="border-2 border-dashed border-[var(--border-paper)] hover:border-[var(--primary-ink)] rounded-2xl p-6 text-center bg-[var(--bg-card)] transition-colors relative cursor-pointer group">
              <input
                type="file"
                required
                accept=".pdf,.pptx,.ppt,.docx,.doc,.png,.jpg,.jpeg,.webp,.svg,.mp4,.webm"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {file ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-oxblood-subtle)] text-[var(--accent-oxblood)] flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <p className="font-display font-bold text-sm text-[var(--text-ink)] truncate max-w-sm">
                    {file.name}
                  </p>
                  <p className="text-xs font-catalogue-mono text-[var(--text-muted)]">
                    Detected format: <span className="uppercase font-bold text-[var(--primary-ink)]">{fileType}</span> • Size: {fileSizeStr}
                  </p>
                  <span className="text-[11px] text-[var(--primary-ink)] font-semibold underline">
                    Click to replace file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-paper-subtle)] text-[var(--text-muted)] group-hover:text-[var(--primary-ink)] flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-display font-semibold text-sm text-[var(--text-ink)]">
                    Drag and drop your lecture file, or browse
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Supported: PDF, PPTX slides, Word DOCX, Diagrams (PNG/JPG), Video MP4 (Up to 100 MB)
                  </p>
                </div>
              )}
            </div>
            {fileError && <p className="text-xs text-rose-600 mt-1">{fileError}</p>}
          </div>

          {/* Academic Hierarchy Selection with "New Shelf" Button */}
          <div className="p-4 rounded-xl bg-[var(--bg-paper-subtle)] border border-[var(--border-paper)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-catalogue-mono text-xs font-bold text-[var(--primary-ink)] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Academic Shelf Placement
              </span>

              {/* Required "New Shelf" Button */}
              <button
                type="button"
                onClick={() => setShowNewShelfModal(true)}
                className="px-2.5 py-1 rounded-lg bg-[var(--accent-oxblood-subtle)] text-[var(--accent-oxblood)] border border-[var(--accent-oxblood)]/30 hover:bg-[var(--accent-oxblood)] hover:text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ New Shelf</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Department */}
              <div>
                <label className="block text-[11px] font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                  Department *
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full text-xs bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)]"
                >
                  {hierarchy.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[11px] font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                  Semester *
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(Number(e.target.value))}
                  className="w-full text-xs bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                  Subject *
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full text-xs bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)]"
                >
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-[11px] font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                  Unit *
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full text-xs bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)]"
                >
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.unitNumber}: {u.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Topic */}
            {availableTopics.length > 0 && (
              <div>
                <label className="block text-[11px] font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                  Specific Topic (Optional)
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full text-xs bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)]"
                >
                  <option value="">General Unit Materials</option>
                  {availableTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Note Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                Document / Lecture Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Molecular Cloning and Restriction Digestion Protocols"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-xl focus:outline-none focus:border-[var(--primary-ink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                Description & Academic Objectives *
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what this document teaches and required prerequisites..."
                className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-xl focus:outline-none focus:border-[var(--primary-ink)]"
              />
            </div>
          </div>

          {/* Metadata: Tags, Importance, Optional Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Enzymes, PCR, Lab Protocol, Exam"
                className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-xl focus:outline-none focus:border-[var(--primary-ink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                Curriculum Importance *
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value as NoteImportance)}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-xl focus:outline-none focus:border-[var(--primary-ink)] font-medium"
              >
                <option value="core">Core Syllabus (Mandatory)</option>
                <option value="reference">Reference / Extended Reading</option>
                <option value="revision">Exam Quick Revision Notes</option>
              </select>
            </div>
          </div>

          {/* Optional Summary Text */}
          <div>
            <label className="block text-xs font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
              Optional Summary / Key Notes Text (Enhances In-App AI Study Tools)
            </label>
            <textarea
              rows={3}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="Paste supplementary formulas, key points, or full text transcript for students who read inside..."
              className="w-full px-3 py-2 text-xs bg-[var(--bg-card)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-xl focus:outline-none focus:border-[var(--primary-ink)] font-mono text-[11px]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[var(--border-paper)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border-paper)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-card)] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[var(--primary-ink)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing to Shelf...' : 'Publish to University Catalogue'}</span>
            </button>
          </div>
        </form>

        {/* Inline "New shelf" Sub-Modal */}
        {showNewShelfModal && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-paper)] w-full max-w-md rounded-2xl border border-[var(--border-paper)] shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-paper)] pb-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-[var(--accent-oxblood)]" />
                  <h3 className="font-display font-bold text-base text-[var(--text-ink)]">
                    Create New Academic Shelf Level
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewShelfModal(false)}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-ink)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {shelfMsg && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">{shelfMsg}</p>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                    Department
                  </label>
                  <select
                    value={shelfDeptId}
                    onChange={(e) => setShelfDeptId(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-lg p-2 text-xs"
                  >
                    {hierarchy.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                    Semester
                  </label>
                  <select
                    value={shelfSemester}
                    onChange={(e) => setShelfSemester(Number(e.target.value))}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-lg p-2 text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BIO205"
                      value={shelfSubjectCode}
                      onChange={(e) => setShelfSubjectCode(e.target.value)}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-lg p-2 text-xs uppercase"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Structural Biology"
                      value={shelfSubjectName}
                      onChange={(e) => setShelfSubjectName(e.target.value)}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                      Unit #
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={shelfUnitNumber}
                      onChange={(e) => setShelfUnitNumber(Number(e.target.value))}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                      Unit Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Protein Crystallography"
                      value={shelfUnitTitle}
                      onChange={(e) => setShelfUnitTitle(e.target.value)}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                    Topic Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. X-ray Diffraction Fundamentals"
                    value={shelfTopicName}
                    onChange={(e) => setShelfTopicName(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-paper)]">
                <button
                  type="button"
                  onClick={() => setShowNewShelfModal(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewShelf}
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent-oxblood)] text-white text-xs font-bold"
                >
                  Save & Apply Shelf
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
