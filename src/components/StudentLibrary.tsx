import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  Presentation, 
  FileCode, 
  Image as ImageIcon, 
  Video, 
  Eye, 
  Download, 
  Layers, 
  Tag, 
  GraduationCap, 
  Calendar, 
  CheckCircle, 
  SlidersHorizontal, 
  Sparkles, 
  Trash2, 
  FolderTree, 
  X,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { BioNote, DepartmentItem, NoteFileType, NoteImportance, User } from '../types/bionotes';
import { filterBioNotes } from '../utils/bionotes-logic';

interface StudentLibraryProps {
  currentUser: User | null;
  hierarchy: DepartmentItem[];
  notes: BioNote[];
  onOpenReader: (note: BioNote) => void;
  onDownloadNote: (note: BioNote) => void;
  onDeleteNote?: (noteId: string) => void;
}

export const StudentLibrary: React.FC<StudentLibraryProps> = ({
  currentUser,
  hierarchy,
  notes,
  onOpenReader,
  onDownloadNote,
  onDeleteNote,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<number>(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<NoteFileType | 'all'>('all');
  const [selectedImportance, setSelectedImportance] = useState<NoteImportance | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'downloads' | 'title'>('date');

  // Derived cascade lists
  const selectedDept = useMemo(
    () => hierarchy.find((d) => d.id === selectedDeptId),
    [hierarchy, selectedDeptId]
  );

  const availableSemesters = useMemo(() => {
    if (!selectedDept) {
      // Gather all distinct semesters
      const sems = new Set<number>();
      hierarchy.forEach((d) => d.semesters.forEach((s) => sems.add(s.semesterNumber)));
      return Array.from(sems).sort((a, b) => a - b);
    }
    return selectedDept.semesters.map((s) => s.semesterNumber).sort((a, b) => a - b);
  }, [selectedDept, hierarchy]);

  const availableSubjects = useMemo(() => {
    let subs: { id: string; name: string; code: string }[] = [];
    if (selectedDept) {
      selectedDept.semesters.forEach((sem) => {
        if (selectedSemester === 0 || sem.semesterNumber === selectedSemester) {
          sem.subjects.forEach((s) => subs.push(s));
        }
      });
    } else {
      hierarchy.forEach((d) =>
        d.semesters.forEach((sem) => {
          if (selectedSemester === 0 || sem.semesterNumber === selectedSemester) {
            sem.subjects.forEach((s) => subs.push(s));
          }
        })
      );
    }
    // Deduplicate by id
    const map = new Map<string, { id: string; name: string; code: string }>();
    subs.forEach((s) => map.set(s.id, s));
    return Array.from(map.values());
  }, [selectedDept, selectedSemester, hierarchy]);

  const selectedSubject = useMemo(() => {
    if (selectedSubjectId === 'all') return null;
    for (const d of hierarchy) {
      for (const sem of d.semesters) {
        const found = sem.subjects.find((s) => s.id === selectedSubjectId);
        if (found) return found;
      }
    }
    return null;
  }, [selectedSubjectId, hierarchy]);

  const availableUnits = useMemo(() => {
    if (!selectedSubject) return [];
    return selectedSubject.units;
  }, [selectedSubject]);

  const selectedUnit = useMemo(() => {
    if (!selectedSubject || selectedUnitId === 'all') return null;
    return selectedSubject.units.find((u) => u.id === selectedUnitId) || null;
  }, [selectedSubject, selectedUnitId]);

  const availableTopics = useMemo(() => {
    if (!selectedUnit) return [];
    return selectedUnit.topics;
  }, [selectedUnit]);

  // Apply filters
  const filteredNotes = useMemo(() => {
    const res = filterBioNotes(notes, {
      searchQuery,
      departmentId: selectedDeptId,
      semester: selectedSemester,
      subjectId: selectedSubjectId,
      unitId: selectedUnitId,
      topicId: selectedTopicId,
      fileType: selectedFileType,
      importance: selectedImportance,
    });

    return [...res].sort((a, b) => {
      if (sortBy === 'views') return b.viewCount - a.viewCount;
      if (sortBy === 'downloads') return b.downloadCount - a.downloadCount;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    notes,
    searchQuery,
    selectedDeptId,
    selectedSemester,
    selectedSubjectId,
    selectedUnitId,
    selectedTopicId,
    selectedFileType,
    selectedImportance,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDeptId('all');
    setSelectedSemester(0);
    setSelectedSubjectId('all');
    setSelectedUnitId('all');
    setSelectedTopicId('all');
    setSelectedFileType('all');
    setSelectedImportance('all');
    setSortBy('date');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedDeptId !== 'all' ||
    selectedSemester !== 0 ||
    selectedSubjectId !== 'all' ||
    selectedUnitId !== 'all' ||
    selectedTopicId !== 'all' ||
    selectedFileType !== 'all' ||
    selectedImportance !== 'all';

  const getFileTypeIcon = (type: NoteFileType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'pptx':
        return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'docx':
        return <FileCode className="w-4 h-4 text-blue-600" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  const getImportanceBadge = (importance: NoteImportance) => {
    switch (importance) {
      case 'core':
        return (
          <span className="font-catalogue-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-oxblood-subtle)] text-[var(--accent-oxblood)] border border-[var(--accent-oxblood)]/20">
            ★ Core Syllabus
          </span>
        );
      case 'reference':
        return (
          <span className="font-catalogue-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-paper-subtle)] text-[var(--primary-ink)] border border-[var(--primary-ink)]/20">
            Reference
          </span>
        );
      case 'revision':
        return (
          <span className="font-catalogue-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            Exam Revision
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Catalogue Search & Header */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-catalogue-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
              <span>Section: Central Library Shelf</span>
              <span>•</span>
              <span>{notes.length} Academic Entries Indexed</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-ink)] tracking-tight">
              University Reading Library
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Select department, semester, and unit to inspect verified faculty lecture documents, presentation slides, and lab protocols.
            </p>
          </div>

          {/* Quick Sort dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-catalogue-mono text-[var(--text-muted)] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-[var(--bg-paper)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-[var(--primary-ink)]"
            >
              <option value="date">Most Recent</option>
              <option value="views">Most Viewed</option>
              <option value="downloads">Most Downloaded</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, faculty author, keyword, subject name, or catalogue code (e.g. 'Mitosis', 'BIO101')..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-[var(--bg-paper)] text-[var(--text-ink)] placeholder-[var(--text-muted)] rounded-xl border border-[var(--border-paper)] focus:outline-none focus:border-[var(--primary-ink)] focus:ring-1 focus:ring-[var(--primary-ink)] font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-ink)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Multi-Dimensional Hierarchy Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-[var(--border-paper)]">
          {/* Department */}
          <div>
            <label className="block text-[11px] font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
              Department
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                setSelectedSemester(0);
                setSelectedSubjectId('all');
                setSelectedUnitId('all');
                setSelectedTopicId('all');
              }}
              className="w-full text-xs bg-[var(--bg-paper)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)]"
            >
              <option value="all">All Departments</option>
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
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(Number(e.target.value));
                setSelectedSubjectId('all');
                setSelectedUnitId('all');
                setSelectedTopicId('all');
              }}
              className="w-full text-xs bg-[var(--bg-paper)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)]"
            >
              <option value={0}>All Semesters</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedUnitId('all');
                setSelectedTopicId('all');
              }}
              className="w-full text-xs bg-[var(--bg-paper)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)]"
            >
              <option value="all">All Subjects</option>
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
              Unit
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => {
                setSelectedUnitId(e.target.value);
                setSelectedTopicId('all');
              }}
              disabled={selectedSubjectId === 'all'}
              className="w-full text-xs bg-[var(--bg-paper)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)] disabled:opacity-50"
            >
              <option value="all">All Units</option>
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  Unit {u.unitNumber}: {u.title}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-[11px] font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
              Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={selectedUnitId === 'all'}
              className="w-full text-xs bg-[var(--bg-paper)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[var(--primary-ink)] disabled:opacity-50"
            >
              <option value="all">All Topics</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag Filters (File Type & Importance) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-paper)] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-catalogue-mono text-[11px] uppercase text-[var(--text-muted)] mr-1">
              Format:
            </span>
            {(['all', 'pdf', 'pptx', 'docx', 'image', 'video'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFileType(fmt)}
                className={`px-2.5 py-1 rounded-md text-xs font-catalogue-mono transition cursor-pointer ${
                  selectedFileType === fmt
                    ? 'bg-[var(--primary-ink)] text-white font-bold'
                    : 'bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-ink)] border border-[var(--border-paper)]'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-catalogue-mono text-[11px] uppercase text-[var(--text-muted)] mr-1">
              Category:
            </span>
            {(['all', 'core', 'reference', 'revision'] as const).map((imp) => (
              <button
                key={imp}
                onClick={() => setSelectedImportance(imp)}
                className={`px-2.5 py-1 rounded-md text-xs font-catalogue-mono transition cursor-pointer ${
                  selectedImportance === imp
                    ? 'bg-[var(--accent-oxblood)] text-white font-bold'
                    : 'bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-ink)] border border-[var(--border-paper)]'
                }`}
              >
                {imp.toUpperCase()}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="ml-2 text-xs text-[var(--accent-oxblood)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-catalogue-mono text-xs font-bold text-[var(--text-ink)]">
            Showing {filteredNotes.length} of {notes.length} Catalogue Items
          </span>
          {hasActiveFilters && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-paper-subtle)] text-[var(--text-muted)] border border-[var(--border-paper)] font-catalogue-mono">
              Filtered
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--text-muted)] font-catalogue-mono">
          Private Real Files • Max 100MB
        </span>
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border-paper)] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-paper-subtle)] text-[var(--text-muted)] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[var(--text-ink)]">
              No academic notes match your search filters
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
              Try broadening your subject/unit filters, clearing the search keyword, or selecting "All Departments".
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[var(--primary-ink)] text-white text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Notes Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const canDelete =
              currentUser &&
              (currentUser.role === 'developer' ||
                (currentUser.role === 'faculty' && note.authorId === currentUser.id));

            return (
              <div
                key={note.id}
                className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] hover:border-[var(--primary-ink)]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Top Catalogue Slip Bar */}
                <div className="p-4 bg-[var(--bg-paper-subtle)] border-b border-[var(--border-paper)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-catalogue-mono text-xs font-bold text-[var(--primary-ink)] px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-paper)] tracking-wide">
                      {note.catalogueNumber}
                    </span>
                    {getImportanceBadge(note.importance)}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-catalogue-mono">
                    {getFileTypeIcon(note.fileType)}
                    <span className="uppercase font-semibold">{note.fileType}</span>
                    <span>•</span>
                    <span>{note.fileSize}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col space-y-3">
                  {/* Department & Breadcrumb Line */}
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-catalogue-mono truncate">
                    <span className="font-semibold text-[var(--text-ink)]">{note.subjectCode}</span>
                    <span>›</span>
                    <span className="truncate">{note.unitTitle.split(':')[0]}</span>
                    {note.topicName && (
                      <>
                        <span>›</span>
                        <span className="truncate">{note.topicName}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => onOpenReader(note)}
                    className="font-display text-lg font-bold text-[var(--text-ink)] group-hover:text-[var(--accent-oxblood)] transition-colors cursor-pointer line-clamp-2 leading-snug"
                  >
                    {note.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed flex-1">
                    {note.description}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-catalogue-mono px-2 py-0.5 rounded-full bg-[var(--bg-paper)] text-[var(--text-muted)] border border-[var(--border-paper)]"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[10px] font-catalogue-mono px-1 text-[var(--text-muted)]">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Author and Date Meta */}
                  <div className="pt-3 border-t border-[var(--border-paper)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span className="font-medium truncate max-w-[170px]" title={note.authorName}>
                      {note.authorName}
                    </span>
                    <div className="flex items-center gap-3 font-catalogue-mono text-[10px]">
                      <span className="flex items-center gap-1" title="Views">
                        <Eye className="w-3 h-3 text-[var(--text-muted)]" />
                        {note.viewCount}
                      </span>
                      <span className="flex items-center gap-1" title="Downloads">
                        <Download className="w-3 h-3 text-[var(--text-muted)]" />
                        {note.downloadCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-3 bg-[var(--bg-paper)] border-t border-[var(--border-paper)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenReader(note)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--primary-ink)] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Inside</span>
                    </button>

                    <button
                      onClick={() => onDownloadNote(note)}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-paper-subtle)] text-[var(--text-ink)] border border-[var(--border-paper)] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Download file directly"
                    >
                      <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </div>

                  {canDelete && onDeleteNote && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove note "${note.title}" from university shelf?`)) {
                          onDeleteNote(note.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Delete this note (Faculty author or Developer)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
