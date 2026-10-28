import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  User, 
  Clock, 
  Type, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';
import { StudyMaterial } from '../types/academic';

interface DocumentReaderModalProps {
  material: StudyMaterial | null;
  onClose: () => void;
  onOpenAIStudyTools: (material: StudyMaterial) => void;
}

export const DocumentReaderModal: React.FC<DocumentReaderModalProps> = ({
  material,
  onClose,
  onOpenAIStudyTools,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  if (!material) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(material.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontSizeClass = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-relaxed',
  }[fontSize];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-title"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/80">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {material.fileType}
              </span>
              <span className="text-xs text-slate-500 font-mono truncate max-w-xs">
                {material.fileName}
              </span>
            </div>
            <h2 id="reader-title" className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {material.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* AI Tools shortcut */}
            <button
              onClick={() => {
                onClose();
                onOpenAIStudyTools(material);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>AI Study Pack</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close reader"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {material.facultyAuthor}
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {material.lastModified}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size toggles */}
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'sm' ? 'bg-white shadow-xs text-slate-900' : ''}`}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'base' ? 'bg-white shadow-xs text-slate-900' : ''}`}
                title="Normal text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'lg' ? 'bg-white shadow-xs text-slate-900' : ''}`}
                title="Large text"
              >
                A+
              </button>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer flex items-center gap-1"
              title="Copy notes"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Drive Link */}
            {material.webViewLink && (
              <a
                href={material.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition flex items-center gap-1 text-[11px] font-medium"
                title="View in Google Drive"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Drive</span>
              </a>
            )}
          </div>
        </div>

        {/* Document Content Body */}
        <div className="p-6 overflow-y-auto font-sans flex-1 bg-slate-50/40">
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-xs">
            <pre className={`whitespace-pre-wrap font-sans text-slate-800 ${fontSizeClass}`}>
              {material.content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Official University Academic Repository Material</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
          >
            Close Reader
          </button>
        </div>

      </div>
    </div>
  );
};
