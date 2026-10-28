import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  Mail, 
  FileCheck, 
  Building2, 
  Award, 
  Send,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import { User, FacultyVerificationRequest, DepartmentItem } from '../types/bionotes';

interface FacultyVerificationViewProps {
  currentUser: User;
  facultyRequest: FacultyVerificationRequest | null;
  departments: DepartmentItem[];
  onSubmitRequest: (formData: {
    department: string;
    staffId: string;
    designation: string;
    qualification: string;
    reason: string;
  }) => Promise<void>;
  onOpenUploadModal: () => void;
}

export const FacultyVerificationView: React.FC<FacultyVerificationViewProps> = ({
  currentUser,
  facultyRequest,
  departments,
  onSubmitRequest,
  onOpenUploadModal,
}) => {
  const isApproved = (currentUser.status === 'active' && currentUser.role === 'faculty') || currentUser.role === 'developer' || facultyRequest?.status === 'approved';
  const isPending = !isApproved && (currentUser.status === 'pending_verification' || facultyRequest?.status === 'pending');
  const isRejected = !isApproved && facultyRequest?.status === 'rejected';

  const [department, setDepartment] = useState(
    facultyRequest?.department || currentUser.facultyProfile?.department || departments[0]?.name || ''
  );
  const [staffId, setStaffId] = useState(
    facultyRequest?.staffId || currentUser.facultyProfile?.staffId || ''
  );
  const [designation, setDesignation] = useState(
    facultyRequest?.designation || currentUser.facultyProfile?.designation || 'Assistant Professor'
  );
  const [qualification, setQualification] = useState(
    facultyRequest?.qualification || currentUser.facultyProfile?.qualification || 'M.Tech / Ph.D.'
  );
  const [reason, setReason] = useState(
    facultyRequest?.reason || currentUser.facultyProfile?.reason || 'Publish official university lecture notes and syllabus study materials.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessBanner(null);

    try {
      await onSubmitRequest({
        department,
        staffId,
        designation,
        qualification,
        reason,
      });
      setSuccessBanner('Your faculty verification credentials have been sent to the Developer Governance Portal.');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Top Breadcrumb & Title */}
      <div className="border-b border-[var(--border-paper)] pb-5">
        <div className="flex items-center gap-2 text-xs font-catalogue-mono text-[var(--accent-oxblood)] uppercase tracking-wider mb-1">
          <span>Faculty Desk</span>
          <span>•</span>
          <span>Credential Accreditation</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-ink)]">
          Faculty Publishing Verification &amp; Desk
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Authorized university faculty can upload real files up to 100 MB, create new course shelves, and publish notes for students.
        </p>
      </div>

      {/* Verification Status Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-paper)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isApproved
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                : isRejected
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border border-amber-200 dark:border-amber-800'
            }`}>
              {isApproved ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : isRejected ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-[var(--text-ink)]">
                  {isApproved
                    ? 'Faculty Credentials Verified & Approved'
                    : isRejected
                    ? 'Verification Requires Revision'
                    : 'Verification Request Pending Developer Approval'}
                </h3>
                <span className={`text-[10px] font-catalogue-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                  isApproved
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : isRejected
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                }`}>
                  {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                </span>
              </div>

              <p className="text-xs text-[var(--text-muted)] mt-1">
                {isApproved
                  ? 'Your institutional credentials have been verified by Developer Governance. Upload tools and shelf creation rights are unlocked for this email.'
                  : isRejected
                  ? `Reviewer feedback: ${facultyRequest?.reviewNote || 'Please update your staff ID or department details.'}`
                  : 'Your verification submission has been transmitted to Developer Portal (master: biospace3690@gmail.com). You will receive upload privileges once approved.'}
              </p>
            </div>
          </div>

          {/* If Approved: Upload Action */}
          {isApproved && (
            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2.5 rounded-xl bg-[var(--primary-ink)] text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Upload Notes to Shelf</span>
            </button>
          )}
        </div>

        {/* Sender Email Notice */}
        <div className="pt-3 border-t border-[var(--border-paper)] flex items-center justify-between flex-wrap gap-2 text-xs text-[var(--text-muted)] font-catalogue-mono">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[var(--accent-oxblood)]" />
            <span>Applicant Email: <strong className="text-[var(--text-ink)]">{currentUser.email}</strong></span>
          </span>
          {facultyRequest?.submittedAt && (
            <span>Last Submitted: {facultyRequest.submittedAt.substring(0, 10)}</span>
          )}
        </div>
      </div>

      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Verification Form (Editable by faculty) */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 sm:p-8 border border-[var(--border-paper)] shadow-sm space-y-6">
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--text-ink)]">
            {isApproved ? 'Verified Faculty Profile' : 'Faculty Verification Submission Form'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Official details are cross-referenced with university department records by the developer portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          <div className="p-3 rounded-xl bg-[var(--bg-paper-subtle)] border border-[var(--border-paper)] flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--text-ink)] block">Sending Request From Email:</span>
              <span className="font-catalogue-mono text-[var(--accent-oxblood)] font-bold">{currentUser.email}</span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">Locked to authenticated session</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-[var(--text-ink)] mb-1">
                University Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl text-[var(--text-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-oxblood)]"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-ink)] mb-1">
                Faculty Staff ID / Employee Number *
              </label>
              <input
                type="text"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. BIO-FAC-319"
                className="w-full p-2.5 bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl text-[var(--text-ink)] font-catalogue-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-[var(--text-ink)] mb-1">
                Academic Designation *
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Associate Professor / Lecturer"
                className="w-full p-2.5 bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl text-[var(--text-ink)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-ink)] mb-1">
                Highest Qualification / Degrees *
              </label>
              <input
                type="text"
                required
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Ph.D. Molecular Biology, M.Tech Biotech"
                className="w-full p-2.5 bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl text-[var(--text-ink)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-ink)] mb-1">
              Reason for Verification &amp; Course Materials Intended for Upload *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the subjects and units you teach and the materials (PDFs, PPTX slides, lab handbooks) you plan to upload..."
              className="w-full p-2.5 bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl text-[var(--text-ink)]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-4">
            <span className="text-[11px] text-[var(--text-muted)]">
              Requests are reviewed by biospace3690@gmail.com
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[var(--accent-oxblood)] text-white text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Transmitting...' : isApproved ? 'Update Faculty Credentials' : 'Submit for Developer Approval'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
