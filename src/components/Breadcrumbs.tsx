import React from 'react';
import { ChevronRight, Home, Building2, Calendar, BookText, Layers } from 'lucide-react';
import { Department, Subject, Unit } from '../types/academic';

interface BreadcrumbsProps {
  department: Department | null;
  semester: number | null;
  subject: Subject | null;
  unit: Unit | null;
  onNavigateHome: () => void;
  onNavigateSemester: () => void;
  onNavigateSubject: () => void;
  onNavigateUnit?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  department,
  semester,
  subject,
  unit,
  onNavigateHome,
  onNavigateSemester,
  onNavigateSubject,
}) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-1.5 text-xs text-slate-500 font-medium">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer text-slate-600"
        >
          <Home className="w-3.5 h-3.5" />
          <span>GM University</span>
        </button>

        {department && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer text-slate-700 font-semibold"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{department.name}</span>
            </button>
          </>
        )}

        {semester && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <button
              onClick={onNavigateSemester}
              className="flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer text-slate-700 font-semibold"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Semester {semester}</span>
            </button>
          </>
        )}

        {subject && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <button
              onClick={onNavigateSubject}
              className="flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer text-slate-700 font-semibold truncate max-w-[200px]"
              title={subject.name}
            >
              <BookText className="w-3.5 h-3.5 text-indigo-600" />
              <span className="truncate">{subject.code}: {subject.name}</span>
            </button>
          </>
        )}

        {unit && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <div className="flex items-center gap-1 text-indigo-900 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Unit {unit.unitNumber}: {unit.title}</span>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
