import React from 'react';
import { 
  Building2, 
  Calendar, 
  Search, 
  BookOpen, 
  Layers, 
  FileText, 
  ExternalLink, 
  Download, 
  Sparkles, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  Tag, 
  Clock, 
  User, 
  FileCheck,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { Department, Subject, Unit, StudyMaterial } from '../types/academic';

interface StudentNavigationStepProps {
  departments: Department[];
  selectedDepartmentId: string;
  onDepartmentSelect: (deptId: string) => void;
  selectedSemester: number;
  onSemesterSelect: (sem: number) => void;
  onSubmitStep3: () => void;
  subjects: Subject[];
  selectedSubject: Subject | null;
  onSubjectSelect: (subject: Subject) => void;
  selectedUnit: Unit | null;
  onUnitSelect: (unit: Unit) => void;
  materials: StudyMaterial[];
  onOpenDocument: (material: StudyMaterial) => void;
  onOpenAIStudyTools: (material: StudyMaterial) => void;
  hasSubmittedStep3: boolean;
}

export const StudentNavigationStep: React.FC<StudentNavigationStepProps> = ({
  departments,
  selectedDepartmentId,
  onDepartmentSelect,
  selectedSemester,
  onSemesterSelect,
  onSubmitStep3,
  subjects,
  selectedSubject,
  onSubjectSelect,
  selectedUnit,
  onUnitSelect,
  materials,
  onOpenDocument,
  onOpenAIStudyTools,
  hasSubmittedStep3,
}) => {
  const currentDept = departments.find((d) => d.id === selectedDepartmentId);

  // Filter materials for the selected unit
  const unitMaterials = selectedUnit
    ? materials.filter((m) => m.unitId === selectedUnit.id)
    : [];

  return (
    <div className="space-y-8">
      
      {/* STEPS 1 to 3: Department, Semester, & Submit Selection Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1-3</span>
              Academic Selection Pathway
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your university department and academic semester to retrieve official faculty notes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
            <span>Connected to GM University Drive</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          
          {/* Step 1: Select Department */}
          <div className="md:col-span-5 space-y-2">
            <label htmlFor="dept-select" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Step 1: Select Department</span>
            </label>
            <select
              id="dept-select"
              value={selectedDepartmentId}
              onChange={(e) => onDepartmentSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900 cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.shortCode})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Semester */}
          <div className="md:col-span-4 space-y-2">
            <label htmlFor="sem-select" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Step 2: Select Semester</span>
            </label>
            <select
              id="sem-select"
              value={selectedSemester}
              onChange={(e) => onSemesterSelect(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900 cursor-pointer"
            >
              {Array.from({ length: currentDept?.totalSemesters || 8 }, (_, i) => i + 1).map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Submit / Find Notes */}
          <div className="md:col-span-3">
            <button
              onClick={onSubmitStep3}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Step 3: Find Notes</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Selected Department Overview Badge */}
        {currentDept && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
            <div>
              <span className="font-semibold text-slate-800">{currentDept.name}</span>: {currentDept.description}
            </div>
            <div className="text-indigo-600 font-medium">
              Active Curriculum: Semesters 1 through {currentDept.totalSemesters}
            </div>
          </div>
        )}
      </div>

      {/* STEP 4: Select Subject */}
      {hasSubmittedStep3 && (
        <section aria-label="Step 4: Select Subject" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                Select Subject
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {subjects.length} enrolled subjects for {currentDept?.shortCode} - Semester {selectedSemester}
              </p>
            </div>
          </div>

          {subjects.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No subjects configured for this semester yet.</p>
              <p className="text-xs text-slate-500 mt-1">Please switch to Faculty/Admin mode to add courses or map Drive folders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => {
                const isSelected = selectedSubject?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => onSubjectSelect(sub)}
                    className={`p-5 rounded-2xl border transition text-left cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 tracking-wide">
                        {sub.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {sub.credits} Credits
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition line-clamp-1">
                      {sub.name}
                    </h4>

                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <strong className="text-slate-700">{sub.units.length}</strong> Units Available
                      </span>
                      <span className="truncate max-w-[140px] text-slate-600 font-medium" title={sub.facultyInCharge}>
                        {sub.facultyInCharge.split('(')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* STEP 5: Select Unit */}
      {selectedSubject && (
        <section aria-label="Step 5: Select Unit" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">5</span>
                Select Unit &amp; Chapter
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Course: <strong className="text-slate-700">{selectedSubject.code} - {selectedSubject.name}</strong> ({selectedSubject.facultyInCharge})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedSubject.units.map((unit) => {
              const isSelected = selectedUnit?.id === unit.id;
              const unitMatCount = materials.filter((m) => m.unitId === unit.id).length;
              return (
                <div
                  key={unit.id}
                  onClick={() => onUnitSelect(unit)}
                  className={`p-5 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-50/80 to-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Unit {unit.unitNumber}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {unitMatCount} Drive Files
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1.5 leading-snug">
                      {unit.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {unit.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {unit.topics.slice(0, 3).map((topic, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {topic}
                        </span>
                      ))}
                      {unit.topics.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{unit.topics.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* STEP 6: Access Notes & Generate AI Study Materials */}
      {selectedUnit && (
        <section aria-label="Step 6: Access Notes" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">6</span>
                Access Notes &amp; AI Study Materials
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Unit {selectedUnit.unitNumber}: <strong className="text-slate-800">{selectedUnit.title}</strong> — Verified Google Drive mapped materials
              </p>
            </div>
            
            <div className="text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{unitMaterials.filter(m => !m.isRestricted).length} Accessible Documents</span>
            </div>
          </div>

          {unitMaterials.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No notes mapped to this unit yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Faculty can map Drive files to Unit {selectedUnit.unitNumber} from the Admin Studio.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {unitMaterials.map((material) => {
                const isRestricted = material.isRestricted;

                return (
                  <div
                    key={material.id}
                    className={`bg-white rounded-2xl border p-5 transition shadow-xs ${
                      isRestricted
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200/90 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Document Details */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            material.fileType === 'pdf'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : material.fileType === 'slides'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {material.fileType.toUpperCase()}
                          </span>

                          <span className="text-xs text-slate-500 font-mono">
                            {material.fileName}
                          </span>

                          {material.syncStatus === 'synced' && (
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Synced with Drive
                            </span>
                          )}

                          {isRestricted && (
                            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                              <ShieldAlert className="w-3 h-3 text-amber-700" />
                              Access Restricted
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900">
                          {material.title}
                        </h4>

                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {material.facultyAuthor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Modified {material.lastModified}
                          </span>
                          <span className="font-medium text-slate-600">
                            Size: {material.fileSize}
                          </span>
                          <span className="text-slate-400">
                            • {material.downloadCount} downloads
                          </span>
                        </div>

                        {/* Tags */}
                        {material.tags && material.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {material.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1"
                              >
                                <Tag className="w-2.5 h-2.5 text-slate-400" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Restriction explanation banner if unauthorized */}
                        {isRestricted && material.restrictionReason && (
                          <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">Permission Notice:</p>
                              <p className="mt-0.5 text-amber-800">{material.restrictionReason}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center flex-wrap gap-2 shrink-0 pt-2 lg:pt-0">
                        {isRestricted ? (
                          <button
                            disabled
                            className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed flex items-center gap-1.5"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>File Unavailable</span>
                          </button>
                        ) : (
                          <>
                            {/* Read Document Modal Button */}
                            <button
                              onClick={() => onOpenDocument(material)}
                              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                              title="Read document syllabus in reader"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Read Notes</span>
                            </button>

                            {/* Open in Google Drive */}
                            {material.webViewLink && (
                              <a
                                href={material.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                                <span>Google Drive</span>
                              </a>
                            )}

                            {/* Download */}
                            <button
                              onClick={() => {
                                const blob = new Blob([material.content], { type: 'text/plain;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = material.fileName.replace('.pdf', '.txt');
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                              title="Download note text"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-600" />
                              <span>Download</span>
                            </button>

                            {/* AI Study Tools Button */}
                            <button
                              onClick={() => onOpenAIStudyTools(material)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                              <span>AI Study Pack</span>
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

    </div>
  );
};
