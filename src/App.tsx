import React, { useState, useEffect } from 'react';
import { BioHeader } from './components/BioHeader';
import { AccessGateway } from './components/AccessGateway';
import { StudentLibrary } from './components/StudentLibrary';
import { FacultyVerificationView } from './components/FacultyVerificationView';
import { DeveloperPortal } from './components/DeveloperPortal';
import { NoteReaderModal } from './components/NoteReaderModal';
import { FacultyUploadModal } from './components/FacultyUploadModal';
import { CommunitySubmissionsModal } from './components/CommunitySubmissionsModal';
import { 
  User, 
  BioNote, 
  DepartmentItem, 
  FacultyVerificationRequest, 
  CommunityMessage, 
  ActivityLog 
} from './types/bionotes';
import { 
  INITIAL_HIERARCHY, 
  INITIAL_NOTES, 
  INITIAL_USERS, 
  INITIAL_FACULTY_REQUESTS, 
  INITIAL_MESSAGES, 
  INITIAL_ACTIVITY_LOGS 
} from './data/bionotes-initial-data';
import { addShelfToHierarchy } from './utils/bionotes-logic';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('bionotes_theme') === 'dark';
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bionotes_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Active view: 'library' | 'faculty_desk' | 'developer_portal'
  const [activeView, setActiveView] = useState<'library' | 'faculty_desk' | 'developer_portal'>('library');

  // Core Data State (synchronized with backend `/api/bionotes/state`)
  const [hierarchy, setHierarchy] = useState<DepartmentItem[]>(INITIAL_HIERARCHY);
  const [notes, setNotes] = useState<BioNote[]>(INITIAL_NOTES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [facultyRequests, setFacultyRequests] = useState<FacultyVerificationRequest[]>(INITIAL_FACULTY_REQUESTS);
  const [messages, setMessages] = useState<CommunityMessage[]>(INITIAL_MESSAGES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Modals state
  const [readerNote, setReaderNote] = useState<BioNote | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showCommunityModal, setShowCommunityModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bionotes_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bionotes_theme', 'light');
    }
  }, [darkMode]);

  // Persist user session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bionotes_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bionotes_user');
    }
  }, [currentUser]);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Fetch latest state from server
  const fetchServerState = async () => {
    try {
      const res = await fetch('/api/bionotes/state');
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setHierarchy(payload.data.hierarchy || INITIAL_HIERARCHY);
          setNotes(payload.data.notes || INITIAL_NOTES);
          setUsers(payload.data.users || INITIAL_USERS);
          setFacultyRequests(payload.data.facultyRequests || INITIAL_FACULTY_REQUESTS);
          setMessages(payload.data.messages || INITIAL_MESSAGES);
          setActivityLogs(payload.data.activityLogs || INITIAL_ACTIVITY_LOGS);

          // Update current user if status or role changed on server
          if (currentUser) {
            const updatedMe = payload.data.users.find((u: User) => u.id === currentUser.id || u.email === currentUser.email);
            if (updatedMe) {
              setCurrentUser(updatedMe);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Backend server state fetch fallback to local state:', err);
    }
  };

  useEffect(() => {
    fetchServerState();
    // Poll updates every 15s
    const interval = setInterval(fetchServerState, 15000);
    return () => clearInterval(interval);
  }, []);

  // When user logs in
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'developer') {
      setActiveView('developer_portal');
    } else if (user.role === 'faculty') {
      setActiveView('faculty_desk');
    } else {
      setActiveView('library');
    }
    showToast(`Welcome to BioNotes, ${user.name}!`, 'success');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setActiveView('library');
    showToast('Signed out of BioNotes catalogue.', 'info');
  };

  // User Faculty Request for verification
  const handleFacultySubmitRequest = async (formData: {
    department: string;
    staffId: string;
    designation: string;
    qualification: string;
    reason: string;
  }) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/bionotes/faculty/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          fullName: currentUser.name,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit verification');

      // Update local state
      setFacultyRequests((prev) => [data.request, ...prev.filter((r) => r.userId !== currentUser.id)]);
      setCurrentUser((prev) => prev ? { ...prev, status: 'pending_verification' } : null);
      showToast('Faculty verification submitted to Developer Portal.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error submitting request', 'error');
      throw err;
    }
  };

  // Developer reviews faculty request
  const handleReviewFacultyRequest = async (requestId: string, action: 'approved' | 'rejected', note?: string) => {
    try {
      const res = await fetch('/api/bionotes/developer/review-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          reviewNote: note,
          reviewerEmail: currentUser?.email || 'biospace3690@gmail.com',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Review action failed');

      await fetchServerState();
      showToast(`Faculty request marked as ${action}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to review request', 'error');
    }
  };

  // Developer updates user role or status (suspend/restore)
  const handleUpdateUserGovernance = async (targetUserId: string, newStatus?: string, newRole?: string) => {
    try {
      const res = await fetch('/api/bionotes/developer/user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          newStatus,
          newRole,
          requesterEmail: currentUser?.email || 'biospace3690@gmail.com',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');

      await fetchServerState();
      showToast('User permissions updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    }
  };

  // Developer updates curriculum hierarchy
  const handleUpdateHierarchy = async (updated: DepartmentItem[]) => {
    try {
      const res = await fetch('/api/bionotes/hierarchy/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hierarchy: updated }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hierarchy update failed');

      setHierarchy(updated);
      showToast('Curriculum hierarchy updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update hierarchy', 'error');
    }
  };

  // Note uploaded by faculty or developer
  const handleUploadSuccess = (newNote: BioNote) => {
    setNotes((prev) => [newNote, ...prev]);
    showToast(`Note "${newNote.title}" published to shelf ${newNote.catalogueNumber}!`, 'success');
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/bionotes/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userRole: currentUser.role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete note');

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      showToast('Note removed from catalogue.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete note', 'error');
    }
  };

  // Download note handler
  const handleDownloadNote = (note: BioNote) => {
    // Increment download count on server
    fetch(`/api/bionotes/notes/${note.id}/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'download' }),
    }).catch(console.error);

    // Update local count
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, downloadCount: n.downloadCount + 1 } : n))
    );

    // Real browser download trigger
    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.download = note.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Downloading "${note.fileName}" (${note.fileSize})...`, 'success');
  };

  // Community message submission
  const handleSendMessage = async (msgData: {
    subject: string;
    message: string;
    department?: string;
    attachmentName?: string;
    attachmentType?: any;
    attachmentUrl?: string;
    attachmentSize?: string;
  }) => {
    const payload = {
      senderId: currentUser ? currentUser.id : 'usr-guest',
      senderEmail: currentUser ? currentUser.email : 'guest.student@biouniversity.edu',
      senderName: currentUser ? currentUser.name : 'Student Guest',
      senderRole: currentUser ? currentUser.role : 'student',
      ...msgData,
    };

    const res = await fetch('/api/bionotes/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');

    setMessages((prev) => [data.message, ...prev]);
  };

  // Reply to community message
  const handleReplyMessage = async (messageId: string, replyText: string) => {
    if (!currentUser) return;
    const res = await fetch(`/api/bionotes/messages/${messageId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text: replyText,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reply');

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? data.message : m))
    );
  };

  // Find faculty verification request for current user
  const currentFacultyRequest = currentUser
    ? facultyRequests.find((r) => r.userId === currentUser.id || r.email === currentUser.email) || null
    : null;

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] text-[var(--text-ink)] flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div 
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-medium flex items-center gap-2 animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-700'
              : notification.type === 'error'
              ? 'bg-rose-800 text-white border-rose-700'
              : 'bg-[var(--primary-ink)] text-white border-white/20'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Global Header */}
      <BioHeader
        currentUser={currentUser}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onSignOut={handleSignOut}
        onOpenCommunityDesk={() => setShowCommunityModal(true)}
        activeView={activeView}
        onChangeView={(view) => setActiveView(view)}
        unreadMessagesCount={messages.length}
      />

      {/* Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentUser ? (
          /* Gateway: Student & Faculty Dual Cards + Auth */
          <AccessGateway
            onLoginSuccess={handleLoginSuccess}
            onDeveloperQuickAccess={() => {
              // Master developer direct trigger
              const master = users.find((u) => u.email === 'biospace3690@gmail.com') || INITIAL_USERS[0];
              handleLoginSuccess(master);
            }}
          />
        ) : (
          /* Authenticated User View Router */
          <>
            {activeView === 'library' && (
              <StudentLibrary
                currentUser={currentUser}
                hierarchy={hierarchy}
                notes={notes}
                onOpenReader={(note) => setReaderNote(note)}
                onDownloadNote={handleDownloadNote}
                onDeleteNote={handleDeleteNote}
              />
            )}

            {activeView === 'faculty_desk' && (
              <FacultyVerificationView
                currentUser={currentUser}
                facultyRequest={currentFacultyRequest}
                departments={hierarchy}
                onSubmitRequest={handleFacultySubmitRequest}
                onOpenUploadModal={() => setShowUploadModal(true)}
              />
            )}

            {activeView === 'developer_portal' && (
              <DeveloperPortal
                currentUser={currentUser}
                hierarchy={hierarchy}
                notes={notes}
                users={users}
                facultyRequests={facultyRequests}
                activityLogs={activityLogs}
                onReviewFacultyRequest={handleReviewFacultyRequest}
                onUpdateUserGovernance={handleUpdateUserGovernance}
                onUpdateHierarchy={handleUpdateHierarchy}
                onDeleteNote={handleDeleteNote}
              />
            )}
          </>
        )}
      </main>

      {/* In-Site Large Note Reader Modal */}
      {readerNote && (
        <NoteReaderModal
          note={readerNote}
          onClose={() => setReaderNote(null)}
          onDownload={handleDownloadNote}
        />
      )}

      {/* Faculty Upload Modal */}
      {showUploadModal && currentUser && (
        <FacultyUploadModal
          currentUser={currentUser}
          hierarchy={hierarchy}
          existingNotesCount={notes.length}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Community Message & Document / Photo Submission Modal */}
      {showCommunityModal && (
        <CommunitySubmissionsModal
          currentUser={currentUser}
          messages={messages}
          onClose={() => setShowCommunityModal(false)}
          onSendMessage={handleSendMessage}
          onReplyMessage={handleReplyMessage}
        />
      )}

      {/* Library Catalogue Footer */}
      <footer className="mt-auto border-t border-[var(--border-paper)] bg-[var(--bg-card)] py-6 text-xs text-[var(--text-muted)] font-catalogue-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-bold text-[var(--text-ink)]">
              BioNotes Repository • University Academic Archive
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Curriculum-aligned lecture notes, presentation decks, diagrams & video tutorials
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowCommunityModal(true)}
              className="text-[var(--accent-oxblood)] hover:underline cursor-pointer"
            >
              Submit Photo / Document
            </button>
            <span>•</span>
            <span>Master Dev: biospace3690@gmail.com</span>
            <span>•</span>
            <span>Max 100 MB Private Store</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
