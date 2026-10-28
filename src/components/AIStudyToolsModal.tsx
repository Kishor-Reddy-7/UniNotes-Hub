import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  FileCheck, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RefreshCw, 
  Info,
  Check,
  BrainCircuit
} from 'lucide-react';
import { StudyMaterial, QuizQuestion, Flashcard, PracticeQuestion } from '../types/academic';
import { calculateQuizScore, QuizResultSummary } from '../utils/academic-logic';

interface AIStudyToolsModalProps {
  material: StudyMaterial | null;
  onClose: () => void;
}

type TabType = 'summary' | 'quiz' | 'flashcards' | 'practice';

export const AIStudyToolsModal: React.FC<AIStudyToolsModalProps> = ({
  material,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Summary State
  const [summaryData, setSummaryData] = useState<{
    title: string;
    overview: string;
    keyTakeaways: string[];
    detailedSection: string;
    definitions: { term: string; definition: string }[];
  } | null>(null);

  // Quiz State
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizCount, setQuizCount] = useState<number>(5);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResultSummary | null>(null);

  // Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());

  // Practice Questions State
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [expandedPracticeId, setExpandedPracticeId] = useState<string | null>(null);

  // Fetch or generate tool content
  const loadToolData = async (tab: TabType, forceRefresh = false) => {
    if (!material) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/study-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: tab,
          documentTitle: material.title,
          documentContent: material.content,
          options: {
            difficulty: quizDifficulty,
            count: quizCount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: Failed to generate study tool`);
      }

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Failed to process document');
      }

      const data = resData.data;

      if (tab === 'summary') {
        setSummaryData(data);
      } else if (tab === 'quiz') {
        setQuizQuestions(data.questions || []);
        setUserAnswers({});
        setQuizSubmitted(false);
        setQuizResult(null);
      } else if (tab === 'flashcards') {
        setFlashcards(data.flashcards || []);
        setCurrentCardIndex(0);
        setIsFlipped(false);
      } else if (tab === 'practice') {
        setPracticeQuestions(data.questions || []);
      }
    } catch (err: any) {
      console.error('Error generating AI study tool:', err);
      setErrorMessage(err.message || 'Unable to generate study tool from this document.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (material) {
      loadToolData(activeTab);
    }
  }, [material, activeTab]);

  if (!material) return null;

  // Handle quiz submission
  const handleQuizSubmit = () => {
    const result = calculateQuizScore(quizQuestions, userAnswers);
    setQuizResult(result);
    setQuizSubmitted(true);
  };

  // Toggle flashcard mastery
  const toggleMastery = (cardId: string) => {
    setMasteredCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-tools-title"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                <BrainCircuit className="w-5 h-5" />
              </span>
              <h2 id="ai-tools-title" className="text-base sm:text-lg font-bold truncate">
                AI Academic Study Studio
              </h2>
            </div>
            <p className="text-xs text-indigo-200/80 truncate mt-0.5">
              Source: {material.title} ({material.fileName})
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close AI Study Studio"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>AI Summary &amp; Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'quiz'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Interactive Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'flashcards'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'practice'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <span>Practice Exam Questions</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Loading State */}
          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Reading document and generating study materials...</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Extracting lecture text from "{material.fileName}" and building curriculum-aligned study aids.
              </p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Error generating AI study tool</span>
              </div>
              <p>{errorMessage}</p>
              <button
                onClick={() => loadToolData(activeTab, true)}
                className="px-3 py-1.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* TAB 1: AI SUMMARY */}
          {!isLoading && !errorMessage && activeTab === 'summary' && summaryData && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Executive Overview */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-700">
                    Executive Overview
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">Curriculum Aligned</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-sans">
                  {summaryData.overview}
                </p>
              </div>

              {/* Key Takeaways & Bullets */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Key Points &amp; High-Yield Takeaways
                </h3>
                <ul className="space-y-2">
                  {summaryData.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detailed Academic Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Detailed Academic Explanation
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {summaryData.detailedSection}
                </div>
              </div>

              {/* Definitions Table */}
              {summaryData.definitions && summaryData.definitions.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Essential Glossary &amp; Technical Definitions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {summaryData.definitions.map((def, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="font-bold text-xs text-indigo-900 block mb-1">
                          {def.term}
                        </span>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {def.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERACTIVE QUIZ */}
          {!isLoading && !errorMessage && activeTab === 'quiz' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              {/* Quiz Configuration Controls */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Difficulty:</span>
                    <select
                      value={quizDifficulty}
                      onChange={(e) => {
                        setQuizDifficulty(e.target.value as any);
                        loadToolData('quiz');
                      }}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium cursor-pointer"
                    >
                      <option value="easy">Easy (Foundations)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="hard">Hard (Advanced / Exam)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Questions:</span>
                    <select
                      value={quizCount}
                      onChange={(e) => {
                        setQuizCount(Number(e.target.value));
                        loadToolData('quiz');
                      }}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium cursor-pointer"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={8}>8 Questions</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => loadToolData('quiz', true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate Quiz</span>
                </button>
              </div>

              {/* Quiz Results Card if Submitted */}
              {quizSubmitted && quizResult && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-6 h-6 text-indigo-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          Quiz Completed: {quizResult.scorePercentage}% Score
                        </h4>
                        <p className="text-xs text-slate-600">
                          {quizResult.correctCount} correct out of {quizResult.totalQuestions} questions
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-indigo-700 px-3 py-1 rounded-xl bg-white shadow-xs">
                        Grade {quizResult.grade}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4">
                {quizQuestions.map((q, idx) => {
                  const userAnswer = userAnswers[q.id];
                  const isSubmitted = quizSubmitted;

                  return (
                    <div
                      key={q.id || idx}
                      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          <span className="text-indigo-600 mr-1.5">Q{idx + 1}.</span>
                          {q.question}
                        </h4>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          {q.difficulty}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options?.map((opt, optIdx) => {
                          let isSelected = false;
                          if (q.type === 'mcq') {
                            isSelected = Number(userAnswer) === optIdx;
                          } else {
                            isSelected = String(userAnswer).toLowerCase() === String(opt).toLowerCase();
                          }

                          let optionClass = 'border-slate-200 hover:bg-slate-50 text-slate-700';

                          if (isSubmitted) {
                            let isCorrectOption = false;
                            if (q.type === 'mcq') {
                              isCorrectOption = Number(q.correctAnswer) === optIdx;
                            } else {
                              isCorrectOption = String(q.correctAnswer).toLowerCase() === String(opt).toLowerCase();
                            }

                            if (isCorrectOption) {
                              optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                            } else if (isSelected && !isCorrectOption) {
                              optionClass = 'border-red-400 bg-red-50 text-red-900 line-through';
                            }
                          } else if (isSelected) {
                            optionClass = 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold ring-1 ring-indigo-500';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isSubmitted}
                              onClick={() => {
                                setUserAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: q.type === 'mcq' ? optIdx : opt,
                                }));
                              }}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${optionClass}`}
                            >
                              <span>{opt}</span>
                              {isSubmitted && (
                                <>
                                  {q.type === 'mcq' && Number(q.correctAnswer) === optIdx && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                  {q.type !== 'mcq' && String(q.correctAnswer).toLowerCase() === String(opt).toLowerCase() && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                  {isSelected && (
                                    (q.type === 'mcq' && Number(q.correctAnswer) !== optIdx) ||
                                    (q.type !== 'mcq' && String(q.correctAnswer).toLowerCase() !== String(opt).toLowerCase())
                                  ) && (
                                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                  )}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {isSubmitted && q.explanation && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                          <span className="font-semibold text-slate-900 block">Explanation:</span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Action */}
              <div className="pt-2 flex justify-end">
                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(userAnswers).length === 0}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    Submit Quiz &amp; Grade
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setUserAnswers({});
                      setQuizSubmitted(false);
                      setQuizResult(null);
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FLASHCARDS */}
          {!isLoading && !errorMessage && activeTab === 'flashcards' && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              {flashcards.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                  No flashcards generated. Click Regenerate to build cards from this document.
                </div>
              ) : (
                <>
                  {/* Progress & Card Stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      {masteredCards.size} Mastered
                    </span>
                  </div>

                  {/* 3D Flashcard Container */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="h-64 sm:h-72 w-full rounded-2xl p-8 bg-white border border-slate-200 shadow-md cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative select-none"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-indigo-600">
                        {isFlipped ? 'Answer' : 'Question'}
                      </span>
                      <span className="text-[11px] text-slate-400">Click to flip</span>
                    </div>

                    <div className="my-auto text-center px-4">
                      <p className={`font-medium transition-all ${
                        isFlipped ? 'text-sm sm:text-base text-indigo-950 leading-relaxed font-sans' : 'text-base sm:text-lg text-slate-900 font-bold'
                      }`}>
                        {isFlipped
                          ? flashcards[currentCardIndex]?.back
                          : flashcards[currentCardIndex]?.front}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                      <span>Topic: {flashcards[currentCardIndex]?.topic}</span>
                      <span className="capitalize">{flashcards[currentCardIndex]?.difficulty}</span>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={() => toggleMastery(flashcards[currentCardIndex]?.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        masteredCards.has(flashcards[currentCardIndex]?.id)
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {masteredCards.has(flashcards[currentCardIndex]?.id) ? 'Mastered' : 'Mark as Mastered'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: PRACTICE EXAM QUESTIONS */}
          {!isLoading && !errorMessage && activeTab === 'practice' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                <div>
                  <p className="font-semibold">University Exam Marking Schemes:</p>
                  <p className="text-indigo-700 mt-0.5">Faculty-crafted practice questions with full step-by-step model scoring criteria.</p>
                </div>
                <button
                  onClick={() => loadToolData('practice', true)}
                  className="px-3 py-1 bg-white border border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition cursor-pointer shrink-0"
                >
                  Regenerate
                </button>
              </div>

              {practiceQuestions.map((pq, idx) => {
                const isExpanded = expandedPracticeId === pq.id || expandedPracticeId === String(idx);

                return (
                  <div key={pq.id || idx} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div
                      onClick={() => setExpandedPracticeId(isExpanded ? null : (pq.id || String(idx)))}
                      className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                            {pq.marks} Marks
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{pq.topic}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{pq.question}</h4>
                      </div>

                      <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-indigo-600' : ''}`} />
                    </div>

                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block mb-1">Model Answer &amp; Structure:</span>
                          <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                            {pq.modelAnswer}
                          </div>
                        </div>

                        {pq.keyPoints && pq.keyPoints.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-800 block mb-1">Mandatory Exam Key Points:</span>
                            <ul className="space-y-1">
                              {pq.keyPoints.map((kp, kIdx) => (
                                <li key={kIdx} className="flex items-center gap-2 text-slate-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{kp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI study materials grounded in faculty lecture content</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
