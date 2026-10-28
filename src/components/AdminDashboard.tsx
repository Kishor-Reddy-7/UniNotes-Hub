import React, { useState } from 'react';
import { 
  HardDrive, 
  FolderTree, 
  RefreshCw, 
  Plus, 
  Folder, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Upload, 
  Sliders, 
  Layers, 
  Building2, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  Link, 
  Clock, 
  Check, 
  ArrowRight,
  ShieldAlert,
  Edit2
} from 'lucide-react';
import { Department, Subject, Unit, StudyMaterial, DriveFolderNode, SyncLog } from '../types/academic';
import { validateDriveMapping } from '../utils/academic-logic';

interface AdminDashboardProps {
  departments: Department[];
  subjects: Subject[];
  materials: StudyMaterial[];
  driveTree: DriveFolderNode;
  syncLogs: SyncLog[];
  onAddMaterial: (material: StudyMaterial) => void;
  onUpdateMaterial: (material: StudyMaterial) => void;
  onAddSubject: (subject: Subject) => void;
  onAddUnit: (subjectId: string, unit: Unit) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  departments,
  subjects,
  materials,
  driveTree,
  syncLogs,
  onAddMaterial,
  onUpdateMaterial,
  onAddSubject,
  onAddUnit,
  onTriggerSync,
  isSyncing,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'mapping' | 'add_note' | 'manage_curriculum' | 'sync_logs'>('mapping');
  
  // Mapping modal / form state
  const [selectedDriveNode, setSelectedDriveNode] = useState<DriveFolderNode | null>(null);
  const [mapDeptId, setMapDeptId] = useState<string>(departments[0]?.id || '');
  const [mapSemester, setMapSemester] = useState<number>(1);
  const [mapSubjectId, setMapSubjectId] = useState<string>('');
  const [mapUnitId, setMapUnitId] = useState<string>('');
  const [mappingSuccessMsg, setMappingSuccessMsg] = useState<string | null>(null);
  const [mappingErrorMsg, setMappingErrorMsg] = useState<string | null>(null);

  // New Note Form State
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteFileName, setNewNoteFileName] = useState('');
  const [newNoteFaculty, setNewNoteFaculty] = useState('Dr. Faculty Evaluator');
  const [newNoteFileType, setNewNoteFileType] = useState<'pdf' | 'slides' | 'doc'>('pdf');
  const [newNoteDeptId, setNewNoteDeptId] = useState(departments[0]?.id || '');
  const [newNoteSemester, setNewNoteSemester] = useState(1);
  const [newNoteSubjectId, setNewNoteSubjectId] = useState('');
  const [newNoteUnitId, setNewNoteUnitId] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteDriveUrl, setNewNoteDriveUrl] = useState('');
  const [newNoteIsRestricted, setNewNoteIsRestricted] = useState(false);
  const [newNoteSuccess, setNewNoteSuccess] = useState(false);

  // New Subject Form State
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCredits, setNewSubCredits] = useState(4);
  const [newSubFaculty, setNewSubFaculty] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubDeptId, setNewSubDeptId] = useState(departments[0]?.id || '');
  const [newSubSem, setNewSubSem] = useState(1);
  const [newSubSuccess, setNewSubSuccess] = useState(false);

  // Available subjects for selected department and semester in mapping form
  const availableSubjectsForMapping = subjects.filter(
    (s) => s.departmentId === mapDeptId && s.semester === mapSemester
  );
  const availableUnitsForMapping = subjects.find((s) => s.id === mapSubjectId)?.units || [];

  // Available subjects for new note
  const availableSubjectsForNote = subjects.filter(
    (s) => s.departmentId === newNoteDeptId && s.semester === newNoteSemester
  );
  const availableUnitsForNote = subjects.find((s) => s.id === newNoteSubjectId)?.units || [];

  // Expanded folders in Drive explorer
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    new Set(['gmu-root', 'fld-biotech', 'fld-biotech-sem1', 'fld-bio101', 'fld-staging'])
  );

  const toggleFolder = (id: string) => {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle Save Drive Node Mapping
  const handleSaveMapping = () => {
    if (!selectedDriveNode) return;
    setMappingErrorMsg(null);

    const validation = validateDriveMapping({
      departmentId: mapDeptId,
      semester: mapSemester,
      subjectId: mapSubjectId,
      unitId: mapUnitId,
    });

    if (!validation.isValid) {
      setMappingErrorMsg(`Please select all hierarchy levels: ${validation.missingFields.join(', ')}`);
      return;
    }

    // Attach mapping to node
    selectedDriveNode.mappedTo = {
      departmentId: mapDeptId,
      semester: mapSemester,
      subjectId: mapSubjectId,
      unitId: mapUnitId,
    };

    // If it's a file, also create or update a StudyMaterial record
    if (selectedDriveNode.type === 'file') {
      const existing = materials.find((m) => m.fileName === selectedDriveNode.name);
      if (!existing) {
        const newMat: StudyMaterial = {
          id: `mat-map-${Date.now()}`,
          title: selectedDriveNode.name.replace('.pdf', '').replace(/_/g, ' '),
          fileName: selectedDriveNode.name,
          fileType: 'pdf',
          mimeType: selectedDriveNode.mimeType || 'application/pdf',
          fileSize: selectedDriveNode.size || '3.0 MB',
          lastModified: selectedDriveNode.lastModified || '2026-10-17',
          facultyAuthor: 'Authorized Faculty Department',
          departmentId: mapDeptId,
          semester: mapSemester,
          subjectId: mapSubjectId,
          unitId: mapUnitId,
          driveFileId: selectedDriveNode.id,
          webViewLink: `https://drive.google.com/file/d/${selectedDriveNode.id}/view`,
          syncStatus: 'synced',
          downloadCount: 0,
          tags: ['Drive Mapped', 'Faculty Upload'],
          content: `GM UNIVERSITY - FACULTY OFFICIAL STUDY MATERIAL\nSource File: ${selectedDriveNode.name}\nMapped Drive Path: GM University Drive -> ${departments.find(d => d.id === mapDeptId)?.name} -> Semester ${mapSemester}\n\n1. Overview & Syllabus Objectives:\nThis document was published by university faculty and synchronized via the official Google Drive integration. It covers core lecture concepts, theoretical foundations, derivations, and practice questions for this unit.\n\n2. Key Exam Concepts:\n- In-depth theoretical principles and operational criteria.\n- Review of unit learning outcomes and essential formulas.\n- Critical question patterns from previous examination cycles.`,
        };
        onAddMaterial(newMat);
      }
    }

    setMappingSuccessMsg(`Successfully mapped "${selectedDriveNode.name}" to curriculum hierarchy!`);
    setTimeout(() => {
      setMappingSuccessMsg(null);
      setSelectedDriveNode(null);
    }, 2000);
  };

  // Handle Create Note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle || !newNoteFileName || !newNoteSubjectId || !newNoteUnitId) return;

    const newMat: StudyMaterial = {
      id: `mat-custom-${Date.now()}`,
      title: newNoteTitle,
      fileName: newNoteFileName,
      fileType: newNoteFileType,
      mimeType: newNoteFileType === 'pdf' ? 'application/pdf' : 'application/vnd.google-apps.presentation',
      fileSize: '3.2 MB',
      lastModified: new Date().toISOString().substring(0, 10),
      facultyAuthor: newNoteFaculty,
      departmentId: newNoteDeptId,
      semester: newNoteSemester,
      subjectId: newNoteSubjectId,
      unitId: newNoteUnitId,
      driveFileId: `DRV_CUSTOM_${Date.now()}`,
      webViewLink: newNoteDriveUrl || `https://drive.google.com/file/d/DRV_CUSTOM_${Date.now()}/view`,
      syncStatus: 'synced',
      isRestricted: newNoteIsRestricted,
      restrictionReason: newNoteIsRestricted ? 'Restricted to authenticated Faculty Evaluators only.' : undefined,
      downloadCount: 0,
      tags: ['Faculty Upload', 'Curriculum Aligned'],
      content: newNoteContent || `GM UNIVERSITY FACULTY NOTES: ${newNoteTitle}\nFaculty Author: ${newNoteFaculty}\n\n1. Abstract & Key Theorems:\nSyllabus lecture notes on ${newNoteTitle}.\nKey concepts, formulas, solved problems, and revision notes for undergraduate engineering students.`,
    };

    onAddMaterial(newMat);
    setNewNoteSuccess(true);
    setNewNoteTitle('');
    setNewNoteFileName('');
    setNewNoteContent('');
    setTimeout(() => setNewNoteSuccess(false), 3000);
  };

  // Handle Create Subject
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode || !newSubName || !newSubDeptId) return;

    const newSubject: Subject = {
      id: `sub-custom-${Date.now()}`,
      code: newSubCode.toUpperCase(),
      name: newSubName,
      departmentId: newSubDeptId,
      semester: newSubSem,
      credits: newSubCredits,
      facultyInCharge: newSubFaculty || 'Department Faculty',
      description: newSubDesc || 'Newly configured curriculum course.',
      units: [
        {
          id: `unit-${Date.now()}-1`,
          subjectId: `sub-custom-${Date.now()}`,
          unitNumber: 1,
          title: 'Unit 1: Introduction & Foundations',
          description: 'Core concepts and basic architecture.',
          topics: ['Introduction', 'Foundations'],
        },
        {
          id: `unit-${Date.now()}-2`,
          subjectId: `sub-custom-${Date.now()}`,
          unitNumber: 2,
          title: 'Unit 2: Advanced Principles',
          description: 'Mechanisms and problem solving.',
          topics: ['Advanced Principles', 'Design Analysis'],
        },
      ],
    };

    onAddSubject(newSubject);
    setNewSubSuccess(true);
    setNewSubCode('');
    setNewSubName('');
    setNewSubDesc('');
    setTimeout(() => setNewSubSuccess(false), 3000);
  };

  // Recursive Drive tree renderer
  const renderDriveTree = (node: DriveFolderNode, depth = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolderIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isMapped = Boolean(node.mappedTo?.departmentId);

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center justify-between py-2 px-3 rounded-lg text-xs transition cursor-pointer hover:bg-slate-100 ${
            selectedDriveNode?.id === node.id ? 'bg-indigo-50 border border-indigo-300' : ''
          }`}
          style={{ paddingLeft: `${depth * 18 + 12}px` }}
        >
          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => isFolder && toggleFolder(node.id)}
          >
            {isFolder ? (
              <>
                <button
                  type="button"
                  aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
                  className="p-0.5 text-slate-400 hover:text-slate-600"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                <Folder className={`w-4 h-4 shrink-0 ${isMapped ? 'text-indigo-600' : 'text-amber-500'}`} />
              </>
            ) : (
              <>
                <span className="w-4 shrink-0" />
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              </>
            )}

            <span className="font-medium text-slate-800 truncate" title={node.name}>
              {node.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isMapped ? (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Mapped
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Unmapped
              </span>
            )}

            <button
              onClick={() => {
                setSelectedDriveNode(node);
                if (node.mappedTo?.departmentId) setMapDeptId(node.mappedTo.departmentId);
                if (node.mappedTo?.semester) setMapSemester(node.mappedTo.semester);
                if (node.mappedTo?.subjectId) setMapSubjectId(node.mappedTo.subjectId);
                if (node.mappedTo?.unitId) setMapUnitId(node.mappedTo.unitId);
              }}
              className="px-2 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded border border-slate-200 text-[11px] font-semibold transition cursor-pointer"
            >
              {isMapped ? 'Edit Map' : 'Map Item'}
            </button>
          </div>
        </div>

        {isFolder && isExpanded && hasChildren && (
          <div className="space-y-0.5">
            {node.children!.map((child) => renderDriveTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Hero & Connection Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-400/30">
                Administrator &amp; Faculty Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Drive Connected
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">University Notes Platform Control Center</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Map Google Drive shared folders to departments, semesters, subjects, and units. Manage student access and sync curriculum files automatically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Refresh Drive Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl px-4 shadow-2xs overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveAdminTab('mapping')}
          className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeAdminTab === 'mapping'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderTree className="w-4 h-4 text-indigo-600" />
          <span>Drive Folder Hierarchy &amp; Mapping</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('add_note')}
          className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeAdminTab === 'add_note'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4 text-indigo-600" />
          <span>Add Study Material / Drive Link</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('manage_curriculum')}
          className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeAdminTab === 'manage_curriculum'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Manage Courses &amp; Units</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('sync_logs')}
          className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeAdminTab === 'sync_logs'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Sync History &amp; Access Audit</span>
        </button>
      </div>

      {/* TAB 1: DRIVE HIERARCHY & MANUAL MAPPING */}
      {activeAdminTab === 'mapping' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Drive Explorer Tree */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-600" />
                  Google Drive Academic Directory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any folder or file to associate it with the academic hierarchy.
                </p>
              </div>

              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                GM University Shared Drive
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-2 bg-slate-50/50 max-h-[500px] overflow-y-auto">
              {renderDriveTree(driveTree)}
            </div>
          </div>

          {/* Mapping Control Panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Link className="w-4 h-4 text-indigo-600" />
                Hierarchy Mapping Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign selected Drive folder or file to the academic taxonomy.
              </p>
            </div>

            {selectedDriveNode ? (
              <div className="space-y-4 pt-2">
                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs">
                  <span className="font-bold text-indigo-950 block">Selected Target:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedDriveNode.type === 'folder' ? (
                      <Folder className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                    <span className="font-semibold text-indigo-900 truncate">{selectedDriveNode.name}</span>
                  </div>
                </div>

                {mappingSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{mappingSuccessMsg}</span>
                  </div>
                )}

                {mappingErrorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>{mappingErrorMsg}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Department:</label>
                    <select
                      value={mapDeptId}
                      onChange={(e) => setMapDeptId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Semester:</label>
                    <select
                      value={mapSemester}
                      onChange={(e) => setMapSemester(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                    >
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Subject:</label>
                    <select
                      value={mapSubjectId}
                      onChange={(e) => {
                        setMapSubjectId(e.target.value);
                        setMapUnitId('');
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                    >
                      <option value="">-- Choose Subject --</option>
                      {availableSubjectsForMapping.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.code}: {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Unit / Chapter:</label>
                    <select
                      value={mapUnitId}
                      onChange={(e) => setMapUnitId(e.target.value)}
                      disabled={!mapSubjectId}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 disabled:opacity-50"
                    >
                      <option value="">-- Choose Unit --</option>
                      {availableUnitsForMapping.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          Unit {unit.unitNumber}: {unit.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveMapping}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Hierarchy Mapping</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                <FolderTree className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium text-slate-700">No folder or file selected.</p>
                <p className="mt-1">Select an item from the Drive tree on the left to map it.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: ADD STUDY MATERIAL / DRIVE LINK */}
      {activeAdminTab === 'add_note' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs max-w-2xl mx-auto">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              Add Study Material or Faculty Drive Document
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish lecture notes, slides, or syllabus documents mapped directly to an academic unit.
            </p>
          </div>

          {newNoteSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Study note published and mapped to curriculum successfully!</span>
            </div>
          )}

          <form onSubmit={handleCreateNote} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Document Title *</label>
              <input
                type="text"
                required
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="e.g. Unit 3 - Protein Crystallography & Structure Notes"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">File Name *</label>
                <input
                  type="text"
                  required
                  value={newNoteFileName}
                  onChange={(e) => setNewNoteFileName(e.target.value)}
                  placeholder="e.g. Bio101_ProteinStructure.pdf"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document Type</label>
                <select
                  value={newNoteFileType}
                  onChange={(e) => setNewNoteFileType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="slides">Google Slides / Presentation</option>
                  <option value="doc">Google Doc / Word Document</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department *</label>
                <select
                  value={newNoteDeptId}
                  onChange={(e) => {
                    setNewNoteDeptId(e.target.value);
                    setNewNoteSubjectId('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Semester *</label>
                <select
                  value={newNoteSemester}
                  onChange={(e) => {
                    setNewNoteSemester(Number(e.target.value));
                    setNewNoteSubjectId('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject *</label>
                <select
                  required
                  value={newNoteSubjectId}
                  onChange={(e) => {
                    setNewNoteSubjectId(e.target.value);
                    setNewNoteUnitId('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="">-- Select Subject --</option>
                  {availableSubjectsForNote.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code}: {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Unit / Chapter *</label>
                <select
                  required
                  value={newNoteUnitId}
                  onChange={(e) => setNewNoteUnitId(e.target.value)}
                  disabled={!newNoteSubjectId}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 disabled:opacity-50"
                >
                  <option value="">-- Select Unit --</option>
                  {availableUnitsForNote.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Unit {unit.unitNumber}: {unit.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Faculty In Charge / Author</label>
              <input
                type="text"
                value={newNoteFaculty}
                onChange={(e) => setNewNoteFaculty(e.target.value)}
                placeholder="e.g. Dr. Sunita Sharma, Dept of Biotech"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Google Drive Web Link (Optional)</label>
              <input
                type="url"
                value={newNoteDriveUrl}
                onChange={(e) => setNewNoteDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Extracted Document Content / Syllabus Notes (for AI Tools &amp; Reader) *
              </label>
              <textarea
                rows={4}
                required
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter lecture content, theorems, formulas, and definitions. The AI study engine reads this text to produce summaries, quizzes, and flashcards."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-sans"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                id="restricted-toggle"
                checked={newNoteIsRestricted}
                onChange={(e) => setNewNoteIsRestricted(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
              <label htmlFor="restricted-toggle" className="text-slate-800 font-medium cursor-pointer">
                Restrict access to Faculty Evaluators only (hidden from students)
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Study Material</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MANAGE CURRICULUM & SUBJECTS */}
      {activeAdminTab === 'manage_curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Configure Subject Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add New Curriculum Subject
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Register a new course code and configure units.
              </p>
            </div>

            {newSubSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Subject added to academic curriculum!</span>
              </div>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department</label>
                <select
                  value={newSubDeptId}
                  onChange={(e) => setNewSubDeptId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    placeholder="e.g. CS301"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={newSubSem}
                    onChange={(e) => setNewSubSem(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Operating Systems Architecture"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Faculty In Charge</label>
                <input
                  type="text"
                  value={newSubFaculty}
                  onChange={(e) => setNewSubFaculty(e.target.value)}
                  placeholder="e.g. Prof. Arvind Nambiar"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  placeholder="Brief course objectives..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>

          {/* Existing Subjects List */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Configured Subjects ({subjects.length})</span>
              <span className="text-xs font-normal text-slate-500">GM University</span>
            </h3>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {subjects.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {sub.code} • Sem {sub.semester}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {sub.units.length} Units Configured
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{sub.name}</h4>
                  <p className="text-slate-500 text-[11px]">{sub.facultyInCharge}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: SYNC HISTORY & AUDIT LOGS */}
      {activeAdminTab === 'sync_logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Google Drive Synchronization &amp; Permission Audit Log
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of Drive file polls, metadata updates, and restricted documents.
              </p>
            </div>

            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Poll Now</span>
            </button>
          </div>

          <div className="space-y-3">
            {syncLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      log.status === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                    <span className="font-bold text-slate-900">{log.action}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{log.details}</p>
                </div>

                <div className="text-right shrink-0 text-slate-400 text-[11px] font-mono">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
