import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  BookOpen, 
  Presentation, 
  FileText, 
  FileCode, 
  Image as ImageIcon, 
  Video, 
  ListOrdered, 
  HelpCircle, 
  Copy, 
  Check, 
  RotateCcw,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';
import { BioNote, SlideContent, DocxSection } from '../types/bionotes';

interface NoteReaderModalProps {
  note: BioNote | null;
  onClose: () => void;
  onDownload: (note: BioNote) => void;
}

export const NoteReaderModal: React.FC<NoteReaderModalProps> = ({
  note,
  onClose,
  onDownload,
}) => {
  if (!note) return null;

  // View state
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showAIStudyPanel, setShowAIStudyPanel] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // AI Study Tool States
  const [aiActiveTab, setAiActiveTab] = useState<'summary' | 'quiz' | 'flashcards' | 'practice'>('summary');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, any>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Increment view count on mount
  useEffect(() => {
    fetch(`/api/bionotes/notes/${note.id}/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view' }),
    }).catch((err) => console.error('Failed to increment view:', err));
  }, [note.id]);

  // Reset page/slide when note changes
  useEffect(() => {
    setCurrentPage(1);
    setCurrentSlideIndex(0);
    setZoomLevel(100);
    setAiResult(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [note.id]);

  // Handle AI Tool trigger
  const handleRunAITool = async (tool: 'summary' | 'quiz' | 'flashcards' | 'practice') => {
    setAiActiveTab(tool);
    setAiLoading(true);
    setAiResult(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setFlashcardIndex(0);
    setFlashcardFlipped(false);

    try {
      const endpoint = `/api/bionotes/ai/${tool}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: note.id,
          noteTitle: note.title,
          content: note.extractedContent || note.description,
          summaryType: 'detailed',
          questionCount: 4,
          cardCount: 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');
      setAiResult(data.data);
    } catch (err: any) {
      console.error('AI tool error:', err);
      setAiResult({ error: err.message || 'Failed to generate study materials.' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyExtracted = () => {
    if (note.extractedContent) {
      navigator.clipboard.writeText(note.extractedContent);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  // Safe slide content
  const slides: SlideContent[] = note.slides || [
    {
      slideNumber: 1,
      title: note.title,
      content: note.description,
      bulletPoints: note.tags,
      notes: 'Introductory overview prepared by faculty.',
    },
  ];

  // Safe docx sections
  const docxSections: DocxSection[] = note.docxSections || [
    {
      heading: 'Abstract & Overview',
      body: note.description,
    },
    {
      heading: 'Full Transcript & Study Notes',
      body: note.extractedContent || 'Standard university lecture notes content.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden animate-fadeIn">
      <div className="bg-[var(--bg-paper)] w-full max-w-6xl h-[95vh] rounded-2xl border border-[var(--border-paper)] shadow-2xl flex flex-col overflow-hidden text-[var(--text-ink)]">
        
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[var(--bg-card)] border-b border-[var(--border-paper)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-catalogue-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-paper)] text-[var(--primary-ink)] border border-[var(--border-paper)] shrink-0">
              {note.catalogueNumber}
            </span>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm sm:text-base text-[var(--text-ink)] truncate" title={note.title}>
                {note.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-catalogue-mono truncate">
                <span className="uppercase font-semibold">{note.fileType}</span>
                <span>•</span>
                <span>{note.fileSize}</span>
                <span>•</span>
                <span className="truncate">{note.authorName}</span>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setShowAIStudyPanel(!showAIStudyPanel);
                if (!showAIStudyPanel && !aiResult) {
                  handleRunAITool('summary');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                showAIStudyPanel
                  ? 'bg-[var(--accent-oxblood)] text-white shadow-xs'
                  : 'bg-[var(--bg-paper)] text-[var(--text-ink)] border border-[var(--border-paper)] hover:border-[var(--accent-oxblood)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">AI Study Pack</span>
            </button>

            <button
              onClick={() => onDownload(note)}
              className="px-3 py-1.5 rounded-lg bg-[var(--primary-ink)] text-white hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Download file to device"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-ink)] hover:bg-[var(--bg-paper)] transition cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area (Split with optional AI Study Panel) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* In-Site Reader Viewport */}
          <div className="flex-1 flex flex-col bg-[var(--bg-paper-subtle)] overflow-hidden relative">
            
            {/* Viewer Sub-toolbar (Controls for PDF, PPTX, Docx) */}
            <div className="h-10 px-4 bg-[var(--bg-card)]/80 border-b border-[var(--border-paper)] flex items-center justify-between text-xs font-catalogue-mono">
              <div className="flex items-center gap-3">
                {note.fileType === 'pdf' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-1 rounded hover:bg-[var(--bg-paper)] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      Page {currentPage} of {note.pagesCount || 4}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(note.pagesCount || 4, p + 1))}
                      disabled={currentPage >= (note.pagesCount || 4)}
                      className="p-1 rounded hover:bg-[var(--bg-paper)] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {note.fileType === 'pptx' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentSlideIndex((s) => Math.max(0, s - 1))}
                      disabled={currentSlideIndex <= 0}
                      className="p-1 rounded hover:bg-[var(--bg-paper)] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      Slide {currentSlideIndex + 1} of {slides.length}
                    </span>
                    <button
                      onClick={() => setCurrentSlideIndex((s) => Math.min(slides.length - 1, s + 1))}
                      disabled={currentSlideIndex >= slides.length - 1}
                      className="p-1 rounded hover:bg-[var(--bg-paper)] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {note.fileType === 'docx' && (
                  <span>Academic Transcript & Handout View</span>
                )}

                {note.fileType === 'image' && (
                  <span>High-Resolution Lightbox</span>
                )}

                {note.fileType === 'video' && (
                  <span>Media Player: Video Demonstration</span>
                )}
              </div>

              {/* Zoom & Copy tools */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                  className="p-1 rounded hover:bg-[var(--bg-paper)] cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  className="p-1 rounded hover:bg-[var(--bg-paper)] cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[var(--border-paper)]">|</span>
                <button
                  onClick={handleCopyExtracted}
                  className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-ink)] cursor-pointer"
                  title="Copy full text transcript"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copiedText ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            {/* In-Site Format-Specific Document Viewer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
              
              {/* 1. PDF Viewer: Realistic Academic Paper Layout */}
              {note.fileType === 'pdf' && (
                <div 
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="w-full max-w-3xl bg-[var(--bg-paper)] border border-[var(--border-paper)] shadow-lg rounded-xl p-8 sm:p-12 space-y-6 text-[var(--text-ink)] font-serif"
                >
                  {/* Academic Paper Header */}
                  <div className="border-b-2 border-[var(--primary-ink)] pb-4 text-center space-y-2">
                    <p className="text-[11px] font-catalogue-mono tracking-widest uppercase text-[var(--text-muted)]">
                      {note.departmentName} • {note.subjectCode}
                    </p>
                    <h1 className="font-display text-2xl font-black text-[var(--text-ink)]">
                      {note.title}
                    </h1>
                    <p className="text-xs font-sans text-[var(--text-muted)]">
                      Faculty Author: <span className="font-semibold">{note.authorName}</span> ({note.authorEmail})
                    </p>
                  </div>

                  {/* Simulated PDF Page Content */}
                  <div className="space-y-4 text-sm leading-relaxed text-justify font-serif">
                    <div className="p-4 bg-[var(--bg-paper-subtle)] rounded-lg border-l-4 border-[var(--primary-ink)] font-sans text-xs italic text-[var(--text-muted)]">
                      <strong>Abstract & Synopsis:</strong> {note.description}
                    </div>

                    <h4 className="font-display font-bold text-base text-[var(--text-ink)] pt-2">
                      Section {currentPage}.0 — Key Principles & Syllabus Objectives
                    </h4>

                    {currentPage === 1 && (
                      <div className="space-y-3 font-sans text-xs sm:text-sm text-[var(--text-ink)] leading-relaxed">
                        <p>{note.extractedContent.split('. ').slice(0, 4).join('. ')}.</p>
                        <p>{note.extractedContent.split('. ').slice(4, 8).join('. ')}.</p>
                        
                        <div className="my-4 p-4 rounded-xl border border-[var(--border-paper)] bg-[var(--bg-card)]">
                          <p className="font-catalogue-mono font-bold text-[11px] text-[var(--primary-ink)] uppercase mb-2">
                            Table 1.1: Core Nomenclature & Taxonomy
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-xs">
                            {note.tags.map((tag, idx) => (
                              <li key={idx}><strong>{tag}:</strong> Core syllabus terminology and mechanism.</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {currentPage > 1 && (
                      <div className="space-y-3 font-sans text-xs sm:text-sm text-[var(--text-ink)] leading-relaxed">
                        <p>
                          <strong>Detailed Module Observations (Page {currentPage}):</strong>{' '}
                          {note.extractedContent.split('. ').slice(currentPage * 2, (currentPage + 1) * 3).join('. ') ||
                            'Further empirical formulas, reaction kinetics, and laboratory protocol notes for advanced studies.'}
                        </p>
                        <p>
                          Standard exam questions typically evaluate the mechanisms detailed herein. Refer to faculty office hours or syllabus guidelines for practical experiment verification.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PDF Footer page number */}
                  <div className="pt-6 border-t border-[var(--border-paper)] flex items-center justify-between text-[11px] font-catalogue-mono text-[var(--text-muted)] font-sans">
                    <span>BioNotes Catalogue: {note.catalogueNumber}</span>
                    <span>Page {currentPage} of {note.pagesCount || 4}</span>
                  </div>
                </div>
              )}

              {/* 2. PPTX Viewer: Interactive Presentation Player with Speaker Notes */}
              {note.fileType === 'pptx' && (
                <div 
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="w-full max-w-4xl space-y-4"
                >
                  {/* Presentation Slide Canvas */}
                  <div className="aspect-[16/9] bg-gradient-to-br from-[var(--primary-ink)] to-[#0c1626] rounded-2xl shadow-xl text-white p-6 sm:p-10 flex flex-col justify-between border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3">
                      <span className="font-catalogue-mono text-xs uppercase tracking-wider text-white/70">
                        {note.subjectCode} • Slide {currentSlideIndex + 1}/{slides.length}
                      </span>
                      <span className="font-catalogue-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-white/90">
                        GM University Lecture Deck
                      </span>
                    </div>

                    <div className="space-y-4 my-auto">
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {slides[currentSlideIndex]?.title || note.title}
                      </h2>
                      <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
                        {slides[currentSlideIndex]?.content}
                      </p>

                      {slides[currentSlideIndex]?.bulletPoints && (
                        <ul className="space-y-2 pt-2">
                          {slides[currentSlideIndex].bulletPoints!.map((pt, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-oxblood)]" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/15 text-xs text-white/60">
                      <span>Faculty: {note.authorName}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentSlideIndex((s) => Math.max(0, s - 1))}
                          disabled={currentSlideIndex === 0}
                          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setCurrentSlideIndex((s) => Math.min(slides.length - 1, s + 1))}
                          disabled={currentSlideIndex === slides.length - 1}
                          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Speaker Notes Pane */}
                  <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-paper)]">
                    <p className="font-catalogue-mono text-xs font-bold text-[var(--accent-oxblood)] uppercase mb-1">
                      Faculty Speaker Lecture Notes:
                    </p>
                    <p className="text-xs text-[var(--text-muted)] italic">
                      {slides[currentSlideIndex]?.notes || 'Emphasize the core regulatory pathways and biological significance during revision.'}
                    </p>
                  </div>
                </div>
              )}

              {/* 3. DOCX Viewer: Academic Text Transcript */}
              {note.fileType === 'docx' && (
                <div 
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="w-full max-w-3xl bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] shadow-md p-6 sm:p-10 space-y-6"
                >
                  <div className="border-b border-[var(--border-paper)] pb-4">
                    <span className="font-catalogue-mono text-xs text-[var(--primary-ink)] font-bold uppercase">
                      Official Curriculum Protocol & Documentation
                    </span>
                    <h2 className="font-display text-2xl font-bold text-[var(--text-ink)] mt-1">
                      {note.title}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-1 font-catalogue-mono">
                      Department of {note.departmentName} • Staff In-Charge: {note.authorName}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {docxSections.map((sec, idx) => (
                      <div key={idx} className="space-y-2">
                        <h3 className="font-display font-bold text-base text-[var(--text-ink)] flex items-center gap-2">
                          <span className="text-[var(--accent-oxblood)] font-catalogue-mono text-sm">
                            §{idx + 1}.0
                          </span>
                          <span>{sec.heading}</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--text-ink)] leading-relaxed whitespace-pre-line">
                          {sec.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Image Lightbox Viewer */}
              {note.fileType === 'image' && (
                <div 
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                  className="max-w-4xl max-h-[70vh] flex flex-col items-center justify-center p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] shadow-lg"
                >
                  {note.fileUrl.startsWith('data:image') || note.fileUrl.startsWith('http') ? (
                    <img
                      src={note.fileUrl}
                      alt={note.title}
                      className="max-h-[55vh] object-contain rounded-lg border border-[var(--border-paper)]"
                    />
                  ) : (
                    /* High-fidelity Diagram Fallback SVG */
                    <div className="w-full max-w-xl aspect-[4/3] bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 rounded-xl flex flex-col items-center justify-center text-white p-8 text-center space-y-4">
                      <ImageIcon className="w-16 h-16 text-emerald-400 animate-pulse" />
                      <div>
                        <h3 className="font-display text-xl font-bold text-white">{note.title}</h3>
                        <p className="text-xs text-white/70 mt-1 max-w-md">{note.description}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/10 text-xs font-catalogue-mono text-emerald-300">
                        Resolution: 3840 x 2160 • High Fidelity Scientific Chart
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <p className="font-display font-bold text-sm text-[var(--text-ink)]">{note.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{note.description}</p>
                  </div>
                </div>
              )}

              {/* 5. Video Player Viewer */}
              {note.fileType === 'video' && (
                <div 
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="w-full max-w-4xl bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] shadow-lg p-4 sm:p-6 space-y-4"
                >
                  <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
                    {note.fileUrl.startsWith('data:video') || note.fileUrl.startsWith('http') ? (
                      <video
                        src={note.fileUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      /* Interactive Video Canvas Simulation */
                      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-purple-600/30 border-2 border-purple-400 flex items-center justify-center text-purple-300">
                          <Video className="w-8 h-8" />
                        </div>
                        <h3 className="font-display text-lg font-bold">{note.title}</h3>
                        <p className="text-xs text-white/70 max-w-md">{note.description}</p>
                        <span className="font-catalogue-mono text-[11px] text-purple-300 px-3 py-1 rounded-full bg-purple-500/20">
                          Lecture Demo • 1080p HD
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="font-catalogue-mono">Topic: {note.topicName || note.subjectName}</span>
                    <span>Instructor: {note.authorName}</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* AI Study Pack Slide-Over Panel */}
          {showAIStudyPanel && (
            <div className="w-full sm:w-96 bg-[var(--bg-card)] border-l border-[var(--border-paper)] flex flex-col animate-slideLeft z-10 shadow-xl">
              {/* AI Panel Header */}
              <div className="p-4 border-b border-[var(--border-paper)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--accent-oxblood-subtle)] text-[var(--accent-oxblood)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-[var(--text-ink)]">
                      AI Study Pack
                    </h3>
                    <p className="text-[10px] font-catalogue-mono text-[var(--text-muted)]">
                      Powered by Google Gemini AI
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAIStudyPanel(false)}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-ink)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* AI Tool Tabs */}
              <div className="grid grid-cols-4 p-2 bg-[var(--bg-paper-subtle)] border-b border-[var(--border-paper)] text-[11px] font-catalogue-mono">
                {(['summary', 'quiz', 'flashcards', 'practice'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleRunAITool(tab)}
                    className={`py-1.5 rounded-md text-center font-bold capitalize transition cursor-pointer ${
                      aiActiveTab === tab
                        ? 'bg-[var(--bg-card)] text-[var(--accent-oxblood)] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* AI Tool Content / Output */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-3 text-center">
                    <div className="w-8 h-8 border-2 border-[var(--accent-oxblood)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-catalogue-mono text-[var(--text-muted)]">
                      Synthesizing academic material...
                    </p>
                  </div>
                ) : aiResult ? (
                  <div className="space-y-4 text-xs">
                    
                    {/* Summary Tab */}
                    {aiActiveTab === 'summary' && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-[var(--bg-paper-subtle)] border border-[var(--border-paper)]">
                          <h4 className="font-display font-bold text-xs text-[var(--primary-ink)] uppercase mb-1">
                            Executive Summary
                          </h4>
                          <p className="text-[var(--text-ink)] leading-relaxed">
                            {aiResult.executiveSummary || aiResult.summary || aiResult.overview || 'Comprehensive syllabus breakdown.'}
                          </p>
                        </div>

                        {(aiResult.keyPoints || aiResult.keyTakeaways) && (
                          <div className="space-y-1.5">
                            <h4 className="font-catalogue-mono font-bold text-[11px] text-[var(--text-muted)] uppercase">
                              Key Takeaways:
                            </h4>
                            <ul className="space-y-1 pl-4 list-disc text-[var(--text-ink)]">
                              {(aiResult.keyPoints || aiResult.keyTakeaways).map((pt: string, i: number) => (
                                <li key={i}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiResult.definitions && (
                          <div className="space-y-1.5 pt-2">
                            <h4 className="font-catalogue-mono font-bold text-[11px] text-[var(--text-muted)] uppercase">
                              Core Definitions:
                            </h4>
                            {aiResult.definitions.map((def: any, i: number) => (
                              <div key={i} className="p-2 rounded bg-[var(--bg-paper)] border border-[var(--border-paper)]">
                                <strong className="text-[var(--accent-oxblood)]">{def.term}: </strong>
                                <span>{def.definition}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quiz Tab */}
                    {aiActiveTab === 'quiz' && (
                      <div className="space-y-4">
                        {(aiResult.questions || []).map((q: any, qIdx: number) => {
                          const isAnswered = quizAnswers[qIdx] !== undefined;
                          const isCorrect = quizAnswers[qIdx] === q.correctAnswer;

                          return (
                            <div
                              key={qIdx}
                              className="p-3 rounded-xl bg-[var(--bg-paper-subtle)] border border-[var(--border-paper)] space-y-2"
                            >
                              <p className="font-bold text-[var(--text-ink)]">
                                Q{qIdx + 1}: {q.question}
                              </p>

                              <div className="space-y-1.5">
                                {q.options?.map((opt: string, optIdx: number) => (
                                  <button
                                    key={optIdx}
                                    disabled={quizSubmitted}
                                    onClick={() =>
                                      setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                                    }
                                    className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                                      quizAnswers[qIdx] === optIdx
                                        ? 'bg-[var(--primary-ink)] text-white border-[var(--primary-ink)] font-semibold'
                                        : 'bg-[var(--bg-card)] text-[var(--text-ink)] border-[var(--border-paper)] hover:bg-[var(--bg-paper)]'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>

                              {quizSubmitted && (
                                <div
                                  className={`p-2 rounded text-[11px] ${
                                    isCorrect
                                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                                  }`}
                                >
                                  <strong>{isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}</strong>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {!quizSubmitted ? (
                          <button
                            onClick={() => setQuizSubmitted(true)}
                            className="w-full py-2 bg-[var(--accent-oxblood)] text-white rounded-lg font-bold text-xs hover:opacity-90 cursor-pointer shadow-xs"
                          >
                            Submit & Score Quiz
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setQuizAnswers({});
                              setQuizSubmitted(false);
                            }}
                            className="w-full py-2 bg-[var(--bg-paper)] text-[var(--text-ink)] border border-[var(--border-paper)] rounded-lg font-bold text-xs hover:bg-[var(--bg-paper-subtle)] cursor-pointer"
                          >
                            Retake Quiz
                          </button>
                        )}
                      </div>
                    )}

                    {/* Flashcards Tab */}
                    {aiActiveTab === 'flashcards' && (
                      <div className="space-y-4">
                        {aiResult.cards && aiResult.cards.length > 0 ? (
                          <div className="space-y-3">
                            <div
                              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                              className="aspect-[4/3] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-paper-subtle)] rounded-2xl border-2 border-[var(--border-paper)] hover:border-[var(--accent-oxblood)] p-6 flex flex-col justify-between cursor-pointer select-none shadow-md transition-all text-center"
                            >
                              <span className="font-catalogue-mono text-[10px] text-[var(--text-muted)] uppercase">
                                Card {flashcardIndex + 1} of {aiResult.cards.length} • Click to Flip
                              </span>

                              <div className="my-auto">
                                {!flashcardFlipped ? (
                                  <div className="space-y-2">
                                    <span className="font-catalogue-mono text-xs font-bold text-[var(--primary-ink)] uppercase">
                                      Prompt / Question
                                    </span>
                                    <p className="font-display font-bold text-sm text-[var(--text-ink)]">
                                      {aiResult.cards[flashcardIndex]?.front || aiResult.cards[flashcardIndex]?.question}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <span className="font-catalogue-mono text-xs font-bold text-[var(--accent-oxblood)] uppercase">
                                      Answer & Formula
                                    </span>
                                    <p className="text-xs text-[var(--text-ink)] leading-relaxed">
                                      {aiResult.cards[flashcardIndex]?.back || aiResult.cards[flashcardIndex]?.answer}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <span className="text-[10px] text-[var(--text-muted)] font-catalogue-mono">
                                {flashcardFlipped ? 'Showing Answer' : 'Showing Question'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setFlashcardIndex((i) => Math.max(0, i - 1));
                                  setFlashcardFlipped(false);
                                }}
                                disabled={flashcardIndex === 0}
                                className="px-3 py-1 rounded bg-[var(--bg-paper)] border border-[var(--border-paper)] text-xs disabled:opacity-40 cursor-pointer"
                              >
                                Prev
                              </button>
                              <span className="font-catalogue-mono text-xs text-[var(--text-muted)]">
                                {flashcardIndex + 1} / {aiResult.cards.length}
                              </span>
                              <button
                                onClick={() => {
                                  setFlashcardIndex((i) =>
                                    Math.min(aiResult.cards.length - 1, i + 1)
                                  );
                                  setFlashcardFlipped(false);
                                }}
                                disabled={flashcardIndex === aiResult.cards.length - 1}
                                className="px-3 py-1 rounded bg-[var(--bg-paper)] border border-[var(--border-paper)] text-xs disabled:opacity-40 cursor-pointer"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[var(--text-muted)]">No flashcards generated.</p>
                        )}
                      </div>
                    )}

                    {/* Practice Questions Tab */}
                    {aiActiveTab === 'practice' && (
                      <div className="space-y-3">
                        <p className="text-[11px] text-[var(--text-muted)]">
                          High-probability examination questions derived from syllabus content:
                        </p>
                        {(aiResult.questions || []).map((pq: any, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-[var(--bg-paper-subtle)] border border-[var(--border-paper)] space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-catalogue-mono font-bold text-[10px] text-[var(--accent-oxblood)] uppercase">
                                {pq.marks ? `${pq.marks} Marks Question` : `Practice Question ${i + 1}`}
                              </span>
                            </div>
                            <p className="font-medium text-[var(--text-ink)]">{pq.question}</p>
                            {pq.guidance && (
                              <p className="text-[11px] text-[var(--text-muted)] italic pt-1 border-t border-[var(--border-paper)]">
                                Key points to include: {pq.guidance}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-6 text-center space-y-3 text-[var(--text-muted)]">
                    <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-xs">
                      Click a tab above to generate AI summaries, interactive quizzes, flashcards, or exam practice questions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
