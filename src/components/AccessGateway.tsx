import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Shield, 
  ArrowRight, 
  Lock, 
  Mail, 
  User as UserIcon, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  KeyRound
} from 'lucide-react';
import { User, UserRole } from '../types/bionotes';

interface AccessGatewayProps {
  onLoginSuccess: (user: User) => void;
  onDeveloperQuickAccess: () => void;
}

export const AccessGateway: React.FC<AccessGatewayProps> = ({
  onLoginSuccess,
  onDeveloperQuickAccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        const res = await fetch('/api/bionotes/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: fullName,
            role: selectedRole || 'student',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register');
        onLoginSuccess(data.user);
      } else {
        const res = await fetch('/api/bionotes/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            roleChoice: selectedRole,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials');
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset selector
  const handlePresetLogin = (presetEmail: string, role: UserRole) => {
    setEmail(presetEmail);
    setSelectedRole(role);
    setIsRegistering(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        
        {/* Welcome & Library Headpiece */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-oxblood-subtle)] text-[var(--accent-oxblood)] border border-[var(--accent-oxblood)]/20 text-xs font-catalogue-mono font-bold tracking-wider uppercase">
            <span>Official University Academic Repository</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-[var(--text-ink)] tracking-tight">
            BioNotes
          </h1>
          <p className="font-display italic text-lg sm:text-xl text-[var(--text-muted)] max-w-xl mx-auto">
            "All notes in One Smart Space"
          </p>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl mx-auto">
            A centralized university library catalogue eliminating fragmented messaging groups. Read peer-reviewed faculty lectures, presentation slides, lab handbooks, and generate grounded AI revision aids.
          </p>
        </div>

        {/* STEP 1: Two Role Cards (Student vs Faculty) */}
        {!selectedRole ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Student */}
              <div
                onClick={() => {
                  setSelectedRole('student');
                  setIsRegistering(false);
                  setEmail('alex.student@biouniversity.edu');
                }}
                className="group relative bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-paper)] hover:border-[var(--primary-ink)] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-sm group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="font-catalogue-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                      Enrolled Scholars &amp; Learners
                    </span>
                    <h2 className="font-display text-2xl font-bold text-[var(--text-ink)] mt-1">
                      Student Desk
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Browse the university catalogue by department, semester, subject, unit, and topic. Read PDF pages, slide decks, Word notes, and high-res micrographs directly inside the library viewer.
                  </p>
                  <ul className="space-y-1.5 text-xs text-[var(--text-muted)] pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Full syllabus reading rooms &amp; downloads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Grounded AI summaries, quizzes &amp; flashcards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Direct student document &amp; photo submissions</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--border-paper)] flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Student Library</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Card 2: Faculty */}
              <div
                onClick={() => {
                  setSelectedRole('faculty');
                  setIsRegistering(false);
                  setEmail('dr.sunita@biouniversity.edu');
                }}
                className="group relative bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-paper)] hover:border-[var(--accent-oxblood)] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-sm group-hover:scale-105 transition-transform">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="font-catalogue-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                      University Academic Staff
                    </span>
                    <h2 className="font-display text-2xl font-bold text-[var(--text-ink)] mt-1">
                      Faculty Publishing Desk
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Submit verification credentials to gain authorized uploading tools. Publish original files up to 100 MB (PDF, PPTX, DOCX, images, videos), create missing unit shelves, and mentor learners.
                  </p>
                  <ul className="space-y-1.5 text-xs text-[var(--text-muted)] pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Developer-verified faculty credentials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Private 100 MB file upload &amp; shelf creator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Catalogue view &amp; download analytics</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--border-paper)] flex items-center justify-between text-xs font-bold text-[var(--accent-oxblood)] group-hover:translate-x-1 transition-transform">
                  <span>Faculty Verification &amp; Publishing</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

            </div>

            {/* Developer Portal Access Banner */}
            <div className="bg-[var(--bg-paper-subtle)] rounded-2xl p-4 border border-[var(--border-paper)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-[var(--text-muted)]">
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  System Governance: <strong className="text-[var(--text-ink)]">biospace3690@gmail.com</strong> (Master Developer Account)
                </span>
              </div>
              <button
                onClick={onDeveloperQuickAccess}
                className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Enter Developer Portal</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Sign In / Create Account Screen for the chosen role */
          <div className="max-w-md mx-auto bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border-paper)] shadow-xl space-y-6">
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-ink)] flex items-center gap-1 cursor-pointer"
              >
                ← Back to Selection
              </button>
              <span className="font-catalogue-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[var(--bg-paper-subtle)] text-[var(--text-ink)] border border-[var(--border-paper)]">
                {selectedRole === 'student' ? 'Student Portal' : 'Faculty Portal'}
              </span>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--text-ink)]">
                {isRegistering ? 'Create Academic Account' : 'Welcome to BioNotes'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {selectedRole === 'student'
                  ? 'Sign in to access your university courses and study tools.'
                  : 'Faculty sign-in. Verified staff receive 100 MB upload privileges.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-ink)] mb-1">
                    Full Name &amp; Title *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={selectedRole === 'student' ? 'e.g. Alex Rivera' : 'e.g. Dr. Sunita Sharma'}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl text-[var(--text-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-oxblood)]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-ink)] mb-1">
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@biouniversity.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl text-[var(--text-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-oxblood)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-ink)] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl text-[var(--text-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-oxblood)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[var(--primary-ink)] text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : isRegistering ? 'Complete Registration' : 'Sign In to Catalogue'}
              </button>
            </form>

            {/* Toggle Sign In / Create Account */}
            <div className="text-center pt-2 border-t border-[var(--border-paper)] text-xs text-[var(--text-muted)]">
              {isRegistering ? (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsRegistering(false)}
                    className="font-bold text-[var(--accent-oxblood)] hover:underline cursor-pointer"
                  >
                    Sign In here
                  </button>
                </span>
              ) : (
                <span>
                  Need an academic profile?{' '}
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="font-bold text-[var(--accent-oxblood)] hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </span>
              )}
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="pt-2 border-t border-[var(--border-paper)] space-y-2">
              <span className="font-catalogue-mono text-[10px] uppercase text-[var(--text-muted)] block text-center">
                Quick Demo Presets
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {selectedRole === 'student' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePresetLogin('alex.student@biouniversity.edu', 'student')}
                      className="p-1.5 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-paper)] text-[var(--text-ink)] hover:border-indigo-500 text-center font-medium cursor-pointer"
                    >
                      Alex Rivera (Student)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetLogin('new.student@biouniversity.edu', 'student')}
                      className="p-1.5 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-paper)] text-[var(--text-ink)] hover:border-indigo-500 text-center font-medium cursor-pointer"
                    >
                      New Student
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePresetLogin('dr.sunita@biouniversity.edu', 'faculty')}
                      className="p-1.5 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-paper)] text-[var(--text-ink)] hover:border-amber-500 text-center font-medium cursor-pointer"
                    >
                      Dr. Sharma (Approved)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetLogin('prof.nambiar@biouniversity.edu', 'faculty')}
                      className="p-1.5 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-paper)] text-[var(--text-ink)] hover:border-amber-500 text-center font-medium cursor-pointer"
                    >
                      Prof. Nambiar (Pending)
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
