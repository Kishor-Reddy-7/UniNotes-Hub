import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FolderTree, 
  Clock, 
  Trash2, 
  Plus, 
  Edit3, 
  Lock, 
  ShieldAlert, 
  Layers, 
  Building2, 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Key, 
  FileText,
  UserCheck,
  UserX
} from 'lucide-react';
import { 
  User, 
  FacultyVerificationRequest, 
  DepartmentItem, 
  BioNote, 
  ActivityLog,
  SemesterItem,
  SubjectItem,
  UnitItem,
  TopicItem
} from '../types/bionotes';

interface DeveloperPortalProps {
  currentUser: User;
  users: User[];
  facultyRequests: FacultyVerificationRequest[];
  hierarchy: DepartmentItem[];
  notes: BioNote[];
  activityLogs: ActivityLog[];
  onReviewFacultyRequest: (requestId: string, action: 'approved' | 'rejected', reviewNote?: string) => Promise<void>;
  onUpdateUserGovernance: (targetUserId: string, newStatus?: string, newRole?: string) => Promise<void>;
  onUpdateHierarchy: (newHierarchy: DepartmentItem[], shelfName?: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({
  currentUser,
  users,
  facultyRequests,
  hierarchy,
  notes,
  activityLogs,
  onReviewFacultyRequest,
  onUpdateUserGovernance,
  onUpdateHierarchy,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'hierarchy' | 'notes' | 'logs'>('verifications');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Hierarchy Tree Editing state
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['dept-bio', 'dept-bio-s1', 'sub-bio-101']));
  const [editingDeptName, setEditingDeptName] = useState<string>('');
  const [newDeptName, setNewDeptName] = useState<string>('');
  const [newDeptCode, setNewDeptCode] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const notify = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // 1. Review Faculty
  const handleReview = async (requestId: string, action: 'approved' | 'rejected') => {
    const note = prompt(`Enter optional review note for ${action}:`) || '';
    try {
      await onReviewFacultyRequest(requestId, action, note);
      notify(`Faculty request has been ${action}!`);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // 2. Change User Role / Status
  const handleRoleChange = async (targetUser: User, newRole: string) => {
    if (targetUser.email === 'biospace3690@gmail.com') {
      alert('The master developer account (biospace3690@gmail.com) cannot be demoted.');
      return;
    }
    try {
      await onUpdateUserGovernance(targetUser.id, undefined, newRole);
      notify(`User ${targetUser.email} role updated to ${newRole}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusToggle = async (targetUser: User) => {
    if (targetUser.email === 'biospace3690@gmail.com') {
      alert('The master developer account cannot be suspended.');
      return;
    }
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      await onUpdateUserGovernance(targetUser.id, newStatus, undefined);
      notify(`User ${targetUser.email} status changed to ${newStatus}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 3. Hierarchy Operations
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;

    const newDept: DepartmentItem = {
      id: `dept-${Date.now()}`,
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase(),
      semesters: [
        {
          semesterNumber: 1,
          subjects: [],
        },
      ],
    };

    const updated = [...hierarchy, newDept];
    await onUpdateHierarchy(updated, `Department: ${newDept.name}`);
    setNewDeptName('');
    setNewDeptCode('');
    notify(`Added Department: ${newDept.name}`);
  };

  const handleDeleteDepartment = async (deptId: string) => {
    if (!confirm('Are you sure you want to delete this department and all its course levels?')) return;
    const updated = hierarchy.filter((d) => d.id !== deptId);
    await onUpdateHierarchy(updated);
    notify('Department deleted');
  };

  const handleAddSubjectToSemester = async (deptId: string, semNum: number) => {
    const code = prompt('Enter Subject Code (e.g. BIO202):');
    if (!code) return;
    const name = prompt('Enter Subject Name (e.g. Molecular Enzymology):');
    if (!name) return;

    const updated = hierarchy.map((dept) => {
      if (dept.id !== deptId) return dept;
      return {
        ...dept,
        semesters: dept.semesters.map((sem) => {
          if (sem.semesterNumber !== semNum) return sem;
          const newSub: SubjectItem = {
            id: `sub-${Date.now()}`,
            name,
            code: code.toUpperCase(),
            units: [
              {
                id: `unit-${Date.now()}-1`,
                unitNumber: 1,
                title: 'Unit 1: Foundations & Core Principles',
                topics: [{ id: `top-${Date.now()}-1`, name: 'Introduction' }],
              },
            ],
          };
          return {
            ...sem,
            subjects: [...sem.subjects, newSub],
          };
        }),
      };
    });

    await onUpdateHierarchy(updated, `Subject: ${code} - ${name}`);
    notify(`Added subject ${code}`);
  };

  const handleAddUnitToSubject = async (deptId: string, semNum: number, subId: string) => {
    const title = prompt('Enter Unit Title (e.g. Unit 3: Genetic Recombination):');
    if (!title) return;

    const updated = hierarchy.map((dept) => {
      if (dept.id !== deptId) return dept;
      return {
        ...dept,
        semesters: dept.semesters.map((sem) => {
          if (sem.semesterNumber !== semNum) return sem;
          return {
            ...sem,
            subjects: sem.subjects.map((sub) => {
              if (sub.id !== subId) return sub;
              const nextUnitNum = sub.units.length + 1;
              const newUnit: UnitItem = {
                id: `unit-${Date.now()}`,
                unitNumber: nextUnitNum,
                title: title.startsWith('Unit') ? title : `Unit ${nextUnitNum}: ${title}`,
                topics: [{ id: `top-${Date.now()}`, name: 'Overview' }],
              };
              return {
                ...sub,
                units: [...sub.units, newUnit],
              };
            }),
          };
        }),
      };
    });

    await onUpdateHierarchy(updated, `Unit: ${title}`);
    notify('Added unit to subject');
  };

  const handleAddTopicToUnit = async (deptId: string, semNum: number, subId: string, unitId: string) => {
    const name = prompt('Enter Topic Name:');
    if (!name) return;

    const updated = hierarchy.map((dept) => {
      if (dept.id !== deptId) return dept;
      return {
        ...dept,
        semesters: dept.semesters.map((sem) => {
          if (sem.semesterNumber !== semNum) return sem;
          return {
            ...sem,
            subjects: sem.subjects.map((sub) => {
              if (sub.id !== subId) return sub;
              return {
                ...sub,
                units: sub.units.map((unit) => {
                  if (unit.id !== unitId) return unit;
                  return {
                    ...unit,
                    topics: [...unit.topics, { id: `top-${Date.now()}`, name }],
                  };
                }),
              };
            }),
          };
        }),
      };
    });

    await onUpdateHierarchy(updated, `Topic: ${name}`);
    notify('Added topic to unit');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-catalogue-mono font-bold border border-purple-500/30 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Master Developer Governance
              </span>
              <span className="text-xs text-purple-200/80 font-catalogue-mono">
                Authenticated: biospace3690@gmail.com
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Developer &amp; Administrative Control Center
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Verify faculty credentials, manage student/faculty access roles, curate the complete curriculum hierarchy tree, and monitor library activity logs.
            </p>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-paper)] bg-[var(--bg-card)] rounded-2xl px-4 shadow-xs overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'verifications'
              ? 'border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-ink)]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Faculty Verification Requests ({facultyRequests.filter((r) => r.status === 'pending').length} pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'users'
              ? 'border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-ink)]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Roles &amp; Suspension ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'hierarchy'
              ? 'border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-ink)]'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Curriculum Hierarchy Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'notes'
              ? 'border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-ink)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Catalogue Notes ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === 'logs'
              ? 'border-[var(--accent-oxblood)] text-[var(--accent-oxblood)] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-ink)]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Activity Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: FACULTY VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] p-6 shadow-sm space-y-6">
          <div className="border-b border-[var(--border-paper)] pb-3">
            <h2 className="font-display text-lg font-bold text-[var(--text-ink)]">
              Faculty Accreditation Requests
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Review credential claims. Once approved, the faculty email automatically unlocks the 100 MB upload desk.
            </p>
          </div>

          <div className="space-y-4">
            {facultyRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                No faculty requests found.
              </div>
            ) : (
              facultyRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-[var(--border-paper)] bg-[var(--bg-paper)]/70 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-[var(--text-ink)]">
                          {req.fullName}
                        </h3>
                        <span className={`text-[10px] font-catalogue-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <span className="font-catalogue-mono text-xs text-[var(--accent-oxblood)] font-bold">
                        {req.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status !== 'approved' && (
                        <button
                          onClick={() => handleReview(req.id, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Faculty</span>
                        </button>
                      )}
                      {req.status !== 'rejected' && (
                        <button
                          onClick={() => handleReview(req.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-paper)]">
                    <div>
                      <span className="text-[var(--text-muted)] block text-[11px]">Department:</span>
                      <strong className="text-[var(--text-ink)]">{req.department}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[11px]">Staff ID / Emp Code:</span>
                      <strong className="font-catalogue-mono text-[var(--text-ink)]">{req.staffId}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[11px]">Designation:</span>
                      <strong className="text-[var(--text-ink)]">{req.designation}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-paper)] space-y-1">
                    <span className="font-bold text-[var(--text-ink)] block">Reason &amp; Intended Uploads:</span>
                    <p className="leading-relaxed">{req.reason}</p>
                    {req.qualification && (
                      <p className="text-[11px] text-slate-500 pt-1">
                        Degrees / Qualification: {req.qualification}
                      </p>
                    )}
                  </div>

                  {req.reviewedBy && (
                    <div className="text-[11px] text-[var(--text-muted)] font-catalogue-mono">
                      Reviewed by {req.reviewedBy} on {req.reviewedAt?.substring(0, 10)}
                      {req.reviewNote && ` — "${req.reviewNote}"`}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER GOVERNANCE & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] p-6 shadow-sm space-y-4">
          <div className="border-b border-[var(--border-paper)] pb-3">
            <h2 className="font-display text-lg font-bold text-[var(--text-ink)]">
              User Directory &amp; Access Roles
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Change user roles, suspend or restore library access. Note: The master account (biospace3690@gmail.com) cannot be demoted or suspended.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-paper)] font-catalogue-mono text-[var(--text-muted)] uppercase text-[10px]">
                  <th className="py-3 px-3">User &amp; Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-paper)]">
                {users.map((u) => {
                  const isMaster = u.email.toLowerCase() === 'biospace3690@gmail.com';

                  return (
                    <tr key={u.id} className="hover:bg-[var(--bg-paper-subtle)] transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[var(--text-ink)] flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isMaster && (
                            <span className="p-0.5 rounded bg-purple-100 text-purple-700" title="Protected Master Account">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <span className="font-catalogue-mono text-[11px] text-[var(--text-muted)]">{u.email}</span>
                      </td>

                      <td className="py-3 px-3">
                        {isMaster ? (
                          <span className="font-catalogue-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            Master Developer
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            className="bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-lg p-1 text-xs text-[var(--text-ink)] font-semibold cursor-pointer"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="developer">Developer</option>
                          </select>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`font-catalogue-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.status === 'suspended'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-catalogue-mono text-[11px] text-[var(--text-muted)]">
                        {u.createdAt.substring(0, 10)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {isMaster ? (
                          <span className="text-[11px] text-purple-600 font-bold font-catalogue-mono">
                            Permanent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(u)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              u.status === 'suspended'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Restore User' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CURRICULUM HIERARCHY TREE */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Tree Explorer */}
          <div className="lg:col-span-8 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] p-6 shadow-sm space-y-4">
            <div className="border-b border-[var(--border-paper)] pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--text-ink)]">
                  Academic Taxonomy Tree
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Department &gt; Semester &gt; Subject (Code) &gt; Unit &gt; Topic
                </p>
              </div>
              <span className="text-[11px] font-catalogue-mono text-[var(--text-muted)]">
                {hierarchy.length} Departments Configured
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {hierarchy.map((dept) => {
                const isDeptOpen = expandedNodes.has(dept.id);

                return (
                  <div key={dept.id} className="border border-[var(--border-paper)] rounded-xl p-3 bg-[var(--bg-paper)]/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div 
                        onClick={() => toggleExpand(dept.id)}
                        className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[var(--text-ink)]"
                      >
                        {isDeptOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <Building2 className="w-4 h-4 text-[var(--accent-oxblood)]" />
                        <span>{dept.name} ({dept.code})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const semNum = prompt('Enter Semester Number (1-8):', '1');
                            if (semNum) handleAddSubjectToSemester(dept.id, Number(semNum));
                          }}
                          className="px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-paper)] text-[10px] font-bold text-[var(--text-ink)] hover:border-indigo-500 transition cursor-pointer"
                        >
                          + Subject
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isDeptOpen && (
                      <div className="pl-6 space-y-2 pt-1 border-l-2 border-[var(--border-paper)] ml-2">
                        {dept.semesters.map((sem) => (
                          <div key={sem.semesterNumber} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
                              <span>Semester {sem.semesterNumber} ({sem.subjects.length} subjects)</span>
                              <button
                                onClick={() => handleAddSubjectToSemester(dept.id, sem.semesterNumber)}
                                className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                              >
                                + Add Subject
                              </button>
                            </div>

                            <div className="space-y-1.5 pl-3">
                              {sem.subjects.map((sub) => (
                                <div key={sub.id} className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-paper)] text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[var(--text-ink)]">
                                      <span className="text-[var(--accent-oxblood)] font-catalogue-mono mr-1">[{sub.code}]</span>
                                      {sub.name}
                                    </span>
                                    <button
                                      onClick={() => handleAddUnitToSubject(dept.id, sem.semesterNumber, sub.id)}
                                      className="text-[10px] font-bold text-[var(--accent-oxblood)] hover:underline cursor-pointer"
                                    >
                                      + Unit
                                    </button>
                                  </div>

                                  <div className="pl-3 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-1 mt-1">
                                    {sub.units.map((unit) => (
                                      <div key={unit.id} className="text-[11px] text-[var(--text-muted)] space-y-0.5">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium text-[var(--text-ink)]">
                                            {unit.title}
                                          </span>
                                          <button
                                            onClick={() => handleAddTopicToUnit(dept.id, sem.semesterNumber, sub.id, unit.id)}
                                            className="text-[9px] text-slate-500 hover:underline cursor-pointer"
                                          >
                                            + Topic
                                          </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1 pl-2">
                                          {unit.topics.map((top) => (
                                            <span key={top.id} className="text-[10px] bg-[var(--bg-paper-subtle)] px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                                              • {top.name}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Department Card */}
          <div className="lg:col-span-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] p-6 shadow-sm space-y-4">
            <h2 className="font-display text-base font-bold text-[var(--text-ink)]">
              Create New Department
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Add a university academic discipline to the library catalogue.
            </p>

            <form onSubmit={handleAddDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-ink)] mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g. Molecular Biochemistry"
                  className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl text-[var(--text-ink)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-ink)] mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  placeholder="e.g. BCH"
                  className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-xl font-catalogue-mono uppercase text-[var(--text-ink)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[var(--primary-ink)] text-white font-bold rounded-xl text-xs hover:opacity-95 transition cursor-pointer"
              >
                + Register Department
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB 4: CATALOGUE NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] p-6 shadow-sm space-y-4">
          <div className="border-b border-[var(--border-paper)] pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text-ink)]">
                Catalogue Notes &amp; Analytics
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Monitor readership views, student downloads, and manage shelves.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-paper)] font-catalogue-mono text-[var(--text-muted)] uppercase text-[10px]">
                  <th className="py-3 px-3">Call Number</th>
                  <th className="py-3 px-3">Title &amp; Format</th>
                  <th className="py-3 px-3">Course Shelf</th>
                  <th className="py-3 px-3">Author</th>
                  <th className="py-3 px-3">Readership</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-paper)]">
                {notes.map((note) => (
                  <tr key={note.id} className="hover:bg-[var(--bg-paper-subtle)] transition">
                    <td className="py-3 px-3 font-catalogue-mono font-bold text-[var(--accent-oxblood)]">
                      {note.catalogueNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[var(--text-ink)] block">{note.title}</span>
                      <span className="font-catalogue-mono text-[10px] uppercase text-[var(--text-muted)]">
                        {note.fileType} • {note.fileSize}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--text-muted)]">
                      {note.subjectCode} • Sem {note.semester}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-ink)] font-medium">
                      {note.authorName}
                    </td>
                    <td className="py-3 px-3 font-catalogue-mono text-[11px] text-[var(--text-muted)]">
                      {note.viewCount} views • {note.downloadCount} dl
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete note "${note.title}"?`)) onDeleteNote(note.id);
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Delete note from shelf"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] p-6 shadow-sm space-y-4">
          <div className="border-b border-[var(--border-paper)] pb-3">
            <h2 className="font-display text-lg font-bold text-[var(--text-ink)]">
              Developer System Activity Audit
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Immutable record of faculty verifications, note publications, and role alterations.
            </p>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-[var(--border-paper)] bg-[var(--bg-paper)]/50 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-ink)]">{log.action}</span>
                    <span className="font-catalogue-mono text-[10px] text-[var(--accent-oxblood)] font-bold">
                      {log.userEmail}
                    </span>
                  </div>
                  <p className="text-[var(--text-muted)] leading-relaxed">{log.details}</p>
                </div>
                <span className="font-catalogue-mono text-[10px] text-slate-400 shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
