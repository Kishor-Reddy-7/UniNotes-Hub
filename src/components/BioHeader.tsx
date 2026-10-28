import React from 'react';
import { 
  BookOpen, 
  Moon, 
  Sun, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  Send, 
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { User } from '../types/bionotes';

interface BioHeaderProps {
  currentUser: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSignOut: () => void;
  onOpenCommunityDesk: () => void;
  activeView: 'library' | 'faculty_desk' | 'developer_portal';
  onChangeView: (view: 'library' | 'faculty_desk' | 'developer_portal') => void;
  unreadMessagesCount?: number;
}

export const BioHeader: React.FC<BioHeaderProps> = ({
  currentUser,
  darkMode,
  onToggleDarkMode,
  onSignOut,
  onOpenCommunityDesk,
  activeView,
  onChangeView,
  unreadMessagesCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-paper)]/95 backdrop-blur-md border-b border-[var(--border-paper)] shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & University Brand */}
          <div 
            onClick={() => onChangeView('library')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-ink)] text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg sm:text-xl text-[var(--text-ink)] tracking-tight">
                  BioNotes
                </span>
                <span className="font-catalogue-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-oxblood-subtle)] text-[var(--accent-oxblood)] border border-[var(--accent-oxblood)]/20">
                  Catalogue
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium hidden sm:block">
                All notes in One Smart Space
              </p>
            </div>
          </div>

          {/* Center Navigation if Authenticated */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1 bg-[var(--bg-paper-subtle)] p-1 rounded-xl border border-[var(--border-paper)]">
              <button
                onClick={() => onChangeView('library')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeView === 'library'
                    ? 'bg-[var(--bg-card)] text-[var(--primary-ink)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Reading Rooms</span>
              </button>

              {/* Faculty Desk tab: Only visible to faculty & developer */}
              {(currentUser.role === 'faculty' || currentUser.role === 'developer') && (
                <button
                  onClick={() => onChangeView('faculty_desk')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeView === 'faculty_desk'
                      ? 'bg-[var(--bg-card)] text-[var(--primary-ink)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Faculty Desk</span>
                </button>
              )}

              {/* Developer Portal: Only visible to developer */}
              {currentUser.role === 'developer' && (
                <button
                  onClick={() => onChangeView('developer_portal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeView === 'developer_portal'
                      ? 'bg-[var(--bg-card)] text-[var(--primary-ink)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Developer Portal</span>
                </button>
              )}
            </div>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Community Messages / Document & Photo Submissions */}
            {currentUser && (
              <button
                onClick={onOpenCommunityDesk}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-paper)] bg-[var(--bg-card)] text-[var(--text-ink)] hover:border-[var(--accent-oxblood)] text-xs font-semibold transition shadow-2xs cursor-pointer relative"
                title="Send a message, question, or submit docs & photos to faculty"
              >
                <Send className="w-3.5 h-3.5 text-[var(--accent-oxblood)]" />
                <span className="hidden sm:inline">Submit Notes &amp; Photos</span>
                <span className="sm:hidden">Submit</span>
                {unreadMessagesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-oxblood)]" />
                )}
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl border border-[var(--border-paper)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-ink)] transition cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile Badge & Sign Out */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-[var(--text-ink)] truncate max-w-[140px]">
                    {currentUser.name}
                  </span>
                  <span className="font-catalogue-mono text-[10px] text-[var(--text-muted)] flex items-center justify-end gap-1">
                    {currentUser.role === 'developer' && (
                      <span className="text-purple-600 font-bold">● Master Developer</span>
                    )}
                    {currentUser.role === 'faculty' && (
                      <span className="text-amber-600 font-bold">● Verified Faculty</span>
                    )}
                    {currentUser.role === 'student' && (
                      <span className="text-emerald-600 font-bold">● Student</span>
                    )}
                  </span>
                </div>

                <button
                  onClick={onSignOut}
                  className="p-2 rounded-xl border border-[var(--border-paper)] bg-[var(--bg-card)] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

          </div>

        </div>
      </div>
    </header>
  );
};
