import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  User as UserIcon, 
  Clock, 
  CornerDownRight, 
  Sparkles,
  Download
} from 'lucide-react';
import { CommunityMessage, User, NoteFileType } from '../types/bionotes';

interface CommunitySubmissionsModalProps {
  currentUser: User | null;
  messages: CommunityMessage[];
  onClose: () => void;
  onSendMessage: (msgData: {
    subject: string;
    message: string;
    department?: string;
    attachmentName?: string;
    attachmentType?: NoteFileType | string;
    attachmentUrl?: string;
    attachmentSize?: string;
  }) => Promise<void>;
  onReplyMessage: (messageId: string, replyText: string) => Promise<void>;
}

export const CommunitySubmissionsModal: React.FC<CommunitySubmissionsModalProps> = ({
  currentUser,
  messages,
  onClose,
  onSendMessage,
  onReplyMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [department, setDepartment] = useState('Biotechnology & Bioinformatics');

  // File / Photo Attachment
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentType, setAttachmentType] = useState<string>('');
  const [attachmentSize, setAttachmentSize] = useState<string>('');

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reply state
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [isReplying, setIsReplying] = useState<string | null>(null);

  // Handle Attachment
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Attachment exceeds 25 MB limit for messages.');
      return;
    }

    setAttachedFile(file);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    setAttachmentSize(sizeStr);

    let type: string = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.includes('pdf')) type = 'pdf';
    else if (file.type.includes('presentation') || file.name.endsWith('.pptx')) type = 'pptx';
    else if (file.type.includes('word') || file.name.endsWith('.docx')) type = 'docx';
    setAttachmentType(type);

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Please provide a subject title and message content.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSendMessage({
        subject: subject.trim(),
        message: message.trim(),
        department,
        attachmentName: attachedFile ? attachedFile.name : undefined,
        attachmentType: attachmentType || undefined,
        attachmentUrl: attachmentUrl || undefined,
        attachmentSize: attachmentSize || undefined,
      });

      setSuccessMsg('Your message and document/photo have been submitted to the academic desk.');
      setSubject('');
      setMessage('');
      setAttachedFile(null);
      setAttachmentUrl('');
      setAttachmentType('');
      setAttachmentSize('');
      setActiveTab('history');
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (messageId: string) => {
    const text = replyInputs[messageId]?.trim();
    if (!text) return;

    setIsReplying(messageId);
    try {
      await onReplyMessage(messageId, text);
      setReplyInputs((prev) => ({ ...prev, [messageId]: '' }));
    } catch (err: any) {
      alert('Failed to send reply: ' + (err.message || 'Server error'));
    } finally {
      setIsReplying(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-[var(--bg-paper)] w-full max-w-2xl rounded-2xl border border-[var(--border-paper)] shadow-2xl overflow-hidden text-[var(--text-ink)] my-auto flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-paper)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-oxblood-subtle)] text-[var(--accent-oxblood)] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[var(--text-ink)]">
                Community Desk: Message & Submit Documents
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-catalogue-mono">
                Submit questions, handouts, syllabus errata, or high-res lab diagrams
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

        {/* Tab switch */}
        <div className="flex border-b border-[var(--border-paper)] bg-[var(--bg-paper-subtle)] text-xs font-catalogue-mono">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-3 text-center font-bold transition cursor-pointer border-b-2 ${
              activeTab === 'submit'
                ? 'border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] bg-[var(--bg-card)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-ink)]'
            }`}
          >
            Submit Note / Photo / Message
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-center font-bold transition cursor-pointer border-b-2 ${
              activeTab === 'history'
                ? 'border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] bg-[var(--bg-card)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-ink)]'
            }`}
          >
            Submissions & Faculty Responses ({messages.length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {activeTab === 'submit' ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                    Your Name / Email
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser ? `${currentUser.name} (${currentUser.email})` : 'Student Guest'}
                    className="w-full bg-[var(--bg-paper-subtle)] border border-[var(--border-paper)] rounded-xl px-3 py-2 text-[var(--text-muted)]"
                  />
                </div>

                <div>
                  <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                    Academic Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-xl px-3 py-2 text-[var(--text-ink)] focus:outline-none focus:border-[var(--primary-ink)]"
                  >
                    <option value="Biotechnology & Bioinformatics">Biotechnology & Bioinformatics</option>
                    <option value="Computer Science & Data Science">Computer Science & Data Science</option>
                    <option value="Biochemical Engineering">Biochemical Engineering</option>
                    <option value="General University Inquiry">General University Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                  Topic / Subject Line *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Attached Agarose Gel Photo for Lab Unit 2 or Syllabus Query"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-xl px-3 py-2 text-sm text-[var(--text-ink)] focus:outline-none focus:border-[var(--primary-ink)]"
                />
              </div>

              <div>
                <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                  Message Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your question, request, or details regarding the attached photo/document..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-xl p-3 text-xs text-[var(--text-ink)] focus:outline-none focus:border-[var(--primary-ink)]"
                />
              </div>

              {/* Attach Document or Photo */}
              <div>
                <label className="block font-catalogue-mono uppercase text-[var(--text-muted)] mb-1">
                  Attach Document or Photo (Optional • Up to 25 MB)
                </label>
                <div className="border border-dashed border-[var(--border-paper)] hover:border-[var(--primary-ink)] rounded-xl p-4 text-center bg-[var(--bg-card)] relative cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.docx,.pptx"
                    onChange={handleAttachmentChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {attachedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {attachmentType === 'image' ? (
                          <ImageIcon className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-indigo-600" />
                        )}
                        <span className="font-semibold text-[var(--text-ink)] truncate max-w-xs">
                          {attachedFile.name}
                        </span>
                        <span className="font-catalogue-mono text-[var(--text-muted)]">
                          ({attachmentSize})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachedFile(null);
                          setAttachmentUrl('');
                        }}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-[var(--text-muted)]">
                      <Paperclip className="w-4 h-4" />
                      <span>Click to attach document (PDF/DOCX) or photo (PNG/JPG)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[var(--accent-oxblood)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message & Upload'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Submissions & Replies History */
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center p-8 text-[var(--text-muted)]">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No community submissions recorded yet.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-paper)] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-catalogue-mono font-bold text-[var(--primary-ink)] uppercase px-2 py-0.5 rounded bg-[var(--bg-paper)] border border-[var(--border-paper)]">
                          {msg.senderRole}
                        </span>
                        <span className="font-bold text-[var(--text-ink)]">{msg.senderName}</span>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-catalogue-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-[var(--text-ink)]">
                        {msg.subject}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1 whitespace-pre-line leading-relaxed">
                        {msg.message}
                      </p>
                    </div>

                    {/* Attachment preview if present */}
                    {msg.attachmentName && (
                      <div className="p-2.5 rounded-lg bg-[var(--bg-paper-subtle)] border border-[var(--border-paper)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate max-w-sm">
                          {msg.attachmentType === 'image' ? (
                            <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                          <span className="font-medium text-[var(--text-ink)] truncate">
                            {msg.attachmentName}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-catalogue-mono">
                            ({msg.attachmentSize || 'Attached'})
                          </span>
                        </div>

                        {msg.attachmentUrl && (
                          <a
                            href={msg.attachmentUrl}
                            download={msg.attachmentName}
                            className="px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-paper)] text-[11px] font-semibold flex items-center gap-1 hover:bg-[var(--bg-paper)] cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Replies list */}
                    {msg.replies && msg.replies.length > 0 && (
                      <div className="pl-4 border-l-2 border-[var(--accent-oxblood)] space-y-2 pt-1">
                        <p className="text-[11px] font-catalogue-mono font-bold uppercase text-[var(--accent-oxblood)]">
                          Official Faculty / Developer Responses:
                        </p>
                        {msg.replies.map((rep) => (
                          <div key={rep.id} className="p-2 rounded bg-[var(--bg-paper)] text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-[var(--text-ink)]">
                                {rep.senderName} ({rep.senderRole})
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)] font-catalogue-mono">
                                {rep.timestamp}
                              </span>
                            </div>
                            <p className="text-[var(--text-ink)] mt-1">{rep.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Box for Faculty & Developer */}
                    {currentUser && (currentUser.role === 'faculty' || currentUser.role === 'developer') && (
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Post official faculty response..."
                          value={replyInputs[msg.id] || ''}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({ ...prev, [msg.id]: e.target.value }))
                          }
                          className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-lg text-[var(--text-ink)] focus:outline-none"
                        />
                        <button
                          onClick={() => handleSendReply(msg.id)}
                          disabled={isReplying === msg.id || !replyInputs[msg.id]?.trim()}
                          className="px-3 py-1.5 rounded-lg bg-[var(--primary-ink)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        >
                          {isReplying === msg.id ? 'Sending...' : 'Reply'}
                        </button>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
