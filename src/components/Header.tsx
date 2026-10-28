import React from 'react';
import { 
  GraduationCap, 
  Search, 
  HardDrive, 
  ShieldCheck, 
  RefreshCw, 
  BookOpen, 
  SlidersHorizontal 
} from 'lucide-react';
import { Department } from '../types/academic';

interface HeaderProps {
  currentMode: 'student' | 'admin';
  onModeChange: (mode: 'student' | 'admin') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDepartment: Department | null;
  selectedSemester: number | null;
  onSyncClick: () => void;
  isSyncing: boolean;
  onResetNavigation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  searchQuery,
  onSearchChange,
  selectedDepartment,
  selectedSemester,
  onSyncClick,
  isSyncing,
  onResetNavigation,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & University Brand */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={onResetNavigation}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">UniNotes Hub</span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  GM University
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Centralized Academic Drive &amp; AI Study Materials
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search subjects, units, lecture notes, or faculty..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Status & Portal Switcher */}
          <div className="flex items-center gap-3">
            {/* Drive Sync Status indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span>Drive Synced</span>
              <button
                onClick={onSyncClick}
                disabled={isSyncing}
                title="Sync Google Drive Metadata"
                aria-label="Sync Google Drive Metadata"
                className="hover:bg-emerald-100 p-0.5 rounded transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Portal Switcher Buttons */}
            <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => onModeChange('student')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  currentMode === 'student'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Student Hub</span>
                <span className="sm:hidden">Student</span>
              </button>
              <button
                onClick={() => onModeChange('admin')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  currentMode === 'admin'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Faculty / Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="pt-1 pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes, subjects, faculty..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
