import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  INITIAL_HIERARCHY, 
  INITIAL_NOTES, 
  INITIAL_USERS, 
  INITIAL_FACULTY_REQUESTS, 
  INITIAL_MESSAGES, 
  INITIAL_ACTIVITY_LOGS 
} from './src/data/bionotes-initial-data.ts';
import { 
  DepartmentItem, 
  BioNote, 
  User, 
  FacultyVerificationRequest, 
  CommunityMessage, 
  ActivityLog 
} from './src/types/bionotes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In AI Studio environment, the dev server must always listen on port 3000.
// (process.env.PORT is 8080 where nginx reverse-proxy runs).
const PORT = 3000;

const app = express();
// Support up to 100 MB file uploads as specified in user request
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Initialize Google Gemini AI SDK on the server side
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Server-side persistent storage for BioNotes
const DB_FILE = path.join(__dirname, 'bionotes-store.json');

interface BioNotesDB {
  hierarchy: DepartmentItem[];
  notes: BioNote[];
  users: User[];
  facultyRequests: FacultyVerificationRequest[];
  messages: CommunityMessage[];
  activityLogs: ActivityLog[];
}

function loadDB(): BioNotesDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      // Ensure master developer always exists and has developer role
      let master = data.users.find((u: User) => u.email === 'biospace3690@gmail.com');
      if (!master) {
        data.users.push(INITIAL_USERS[0]);
      } else {
        master.role = 'developer';
        master.status = 'active';
      }
      return data;
    }
  } catch (err) {
    console.error('Error reading bionotes-store.json, resetting to seed:', err);
  }

  const initialData: BioNotesDB = {
    hierarchy: INITIAL_HIERARCHY,
    notes: INITIAL_NOTES,
    users: INITIAL_USERS,
    facultyRequests: INITIAL_FACULTY_REQUESTS,
    messages: INITIAL_MESSAGES,
    activityLogs: INITIAL_ACTIVITY_LOGS,
  };
  saveDB(initialData);
  return initialData;
}

function saveDB(data: BioNotesDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write bionotes-store.json:', err);
  }
}

let db = loadDB();

function logActivity(userEmail: string, action: string, details: string) {
  const log: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userEmail,
    action,
    details,
  };
  db.activityLogs.unshift(log);
  if (db.activityLogs.length > 200) {
    db.activityLogs = db.activityLogs.slice(0, 200);
  }
}

// ----------------- API ROUTES ----------------- //

// 1. Get full state
app.get('/api/bionotes/state', (req, res) => {
  res.json({
    success: true,
    data: {
      hierarchy: db.hierarchy,
      notes: db.notes,
      users: db.users.map(({ ...u }) => u), // send users list
      facultyRequests: db.facultyRequests,
      messages: db.messages,
      activityLogs: db.activityLogs,
    },
  });
});

// 2. Auth: Sign In
app.post('/api/bionotes/auth/login', (req, res) => {
  const { email, password, roleChoice } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Special Master Developer handling
  if (normalizedEmail === 'biospace3690@gmail.com') {
    let dev = db.users.find((u) => u.email.toLowerCase() === 'biospace3690@gmail.com');
    if (!dev) {
      dev = {
        id: 'usr-dev-master',
        email: 'biospace3690@gmail.com',
        name: 'Master Developer (BioNotes)',
        role: 'developer',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      db.users.push(dev);
    }
    dev.role = 'developer';
    dev.status = 'active';
    saveDB(db);
    logActivity(dev.email, 'Developer Login', 'Master developer authenticated into governance portal.');
    return res.json({ success: true, user: dev });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: 'Account not found. Please create an account.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended by the administrator.' });
  }

  logActivity(user.email, 'User Login', `${user.name} (${user.role}) logged into the library catalogue.`);
  res.json({ success: true, user });
});

// 3. Auth: Create Account
app.post('/api/bionotes/auth/register', (req, res) => {
  const { email, name, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and full name are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // If registering with master developer email
  if (normalizedEmail === 'biospace3690@gmail.com') {
    let dev = db.users.find((u) => u.email.toLowerCase() === 'biospace3690@gmail.com');
    if (!dev) {
      dev = {
        id: 'usr-dev-master',
        email: 'biospace3690@gmail.com',
        name: name || 'Master Developer (BioNotes)',
        role: 'developer',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      db.users.push(dev);
      saveDB(db);
    }
    return res.json({ success: true, user: dev });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  // Student accounts are immediately active.
  // Faculty accounts start with status 'pending_verification' until approved by developer.
  const newUserRole = role === 'faculty' ? 'faculty' : 'student';
  const newStatus = newUserRole === 'faculty' ? 'pending_verification' : 'active';

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    email: normalizedEmail,
    name: name.trim(),
    role: newUserRole,
    status: newStatus,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDB(db);

  logActivity(newUser.email, 'Account Created', `New ${newUserRole} account created (${newStatus}).`);
  res.json({ success: true, user: newUser });
});

// 4. Faculty Verification Request
app.post('/api/bionotes/faculty/request-verification', (req, res) => {
  const { userId, email, fullName, department, staffId, designation, qualification, reason } = req.body;

  if (!email || !department || !staffId || !designation) {
    return res.status(400).json({ error: 'Please fill in all mandatory faculty credentials.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if existing request exists
  let request = db.facultyRequests.find((r) => r.email.toLowerCase() === normalizedEmail);
  if (request) {
    request.department = department;
    request.staffId = staffId;
    request.designation = designation;
    request.qualification = qualification;
    request.reason = reason;
    request.status = 'pending';
    request.submittedAt = new Date().toISOString();
  } else {
    request = {
      id: `req-${Date.now()}`,
      userId: userId || `usr-${Date.now()}`,
      email: normalizedEmail,
      fullName: fullName || normalizedEmail,
      department,
      staffId,
      designation,
      qualification,
      reason,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    db.facultyRequests.unshift(request);
  }

  // Update user's profile
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (user) {
    user.role = 'faculty';
    user.status = 'pending_verification';
    user.facultyProfile = {
      department,
      staffId,
      designation,
      qualification,
      reason,
    };
  }

  saveDB(db);
  logActivity(normalizedEmail, 'Faculty Verification Submitted', `Staff ID: ${staffId}, Dept: ${department}`);

  res.json({ success: true, request });
});

// 5. Developer: Review Faculty Request (Approve / Reject)
app.post('/api/bionotes/developer/review-request', (req, res) => {
  const { requestId, action, reviewNote } = req.body;
  const reviewerEmail = req.body.reviewerEmail || 'biospace3690@gmail.com';

  if (reviewerEmail.toLowerCase() !== 'biospace3690@gmail.com') {
    const reviewer = db.users.find((u) => u.email.toLowerCase() === reviewerEmail.toLowerCase());
    if (!reviewer || reviewer.role !== 'developer') {
      return res.status(403).json({ error: 'Unauthorized: Only developers can review faculty verification requests.' });
    }
  }

  const request = db.facultyRequests.find((r) => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Verification request not found.' });
  }

  request.status = action === 'approved' ? 'approved' : 'rejected';
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = reviewerEmail;
  request.reviewNote = reviewNote || '';

  // Update associated user status
  const user = db.users.find((u) => u.email.toLowerCase() === request.email.toLowerCase());
  if (user) {
    if (action === 'approved') {
      user.role = 'faculty';
      user.status = 'active';
    } else {
      user.status = 'pending_verification';
    }
  }

  saveDB(db);
  logActivity(reviewerEmail, `Faculty Request ${action.toUpperCase()}`, `Applicant: ${request.email} (${request.staffId})`);

  res.json({ success: true, request, user });
});

// 6. Developer: Manage User Status / Roles
app.post('/api/bionotes/developer/user-status', (req, res) => {
  const { targetUserId, newStatus, newRole, requesterEmail } = req.body;

  if (requesterEmail?.toLowerCase() !== 'biospace3690@gmail.com') {
    const requester = db.users.find((u) => u.email.toLowerCase() === requesterEmail?.toLowerCase());
    if (!requester || requester.role !== 'developer') {
      return res.status(403).json({ error: 'Unauthorized: Developer permissions required.' });
    }
  }

  const target = db.users.find((u) => u.id === targetUserId);
  if (!target) {
    return res.status(404).json({ error: 'Target user not found.' });
  }

  // The master account cannot be demoted or suspended
  if (target.email.toLowerCase() === 'biospace3690@gmail.com') {
    return res.status(400).json({ error: 'The master developer account (biospace3690@gmail.com) cannot be demoted or suspended.' });
  }

  if (newStatus) target.status = newStatus;
  if (newRole) target.role = newRole;

  saveDB(db);
  logActivity(requesterEmail, 'User Governance Updated', `User ${target.email} set to role: ${target.role}, status: ${target.status}`);

  res.json({ success: true, user: target });
});

// 7. Notes: Upload Note (Server-side Role Enforced)
app.post('/api/bionotes/notes/upload', (req, res) => {
  const { noteData, userEmail, userRole } = req.body;

  const user = db.users.find((u) => u.email.toLowerCase() === userEmail?.toLowerCase());
  if (!user || user.status !== 'active' || (user.role !== 'faculty' && user.role !== 'developer')) {
    return res.status(403).json({ 
      error: 'Unauthorized: Only approved faculty members and developers can upload academic notes to the library.' 
    });
  }

  if (!noteData.title || !noteData.departmentId || !noteData.semester || !noteData.subjectId || !noteData.unitId) {
    return res.status(400).json({ error: 'Missing mandatory course hierarchy or document title.' });
  }

  // Generate catalog number
  const deptCode = db.hierarchy.find((d) => d.id === noteData.departmentId)?.code || 'BIO';
  const subCode = noteData.subjectCode || 'SUB';
  const unitNum = noteData.unitTitle?.match(/\d+/)?.[0] || '1';
  const count = db.notes.length + 1;
  const catalogueNumber = `${deptCode}-S${noteData.semester}-${subCode}-U${unitNum}-${String(count).padStart(3, '0')}`;

  const newNote: BioNote = {
    ...noteData,
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    catalogueNumber,
    authorId: user.id,
    authorEmail: user.email,
    authorName: user.name,
    viewCount: 0,
    downloadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.notes.unshift(newNote);
  saveDB(db);

  logActivity(user.email, 'Note Published to Shelf', `Catalogue Ref: ${catalogueNumber} — "${newNote.title}"`);
  res.json({ success: true, note: newNote });
});

// 8. Notes: Delete Note (Faculty delete only their own, developer can delete any)
app.delete('/api/bionotes/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const { userEmail } = req.body;

  const user = db.users.find((u) => u.email.toLowerCase() === userEmail?.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const noteIndex = db.notes.findIndex((n) => n.id === noteId);
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  const note = db.notes[noteIndex];

  // Role check: Faculty delete only their own notes; developers delete any.
  if (user.role === 'faculty' && note.authorEmail.toLowerCase() !== user.email.toLowerCase()) {
    return res.status(403).json({ error: 'Faculty may only delete their own published notes.' });
  }

  if (user.role !== 'faculty' && user.role !== 'developer') {
    return res.status(403).json({ error: 'Students cannot delete notes.' });
  }

  db.notes.splice(noteIndex, 1);
  saveDB(db);

  logActivity(user.email, 'Note Removed from Shelf', `Deleted note ${note.catalogueNumber} ("${note.title}")`);
  res.json({ success: true, message: 'Note deleted successfully.' });
});

// 9. Notes: Track View / Download Counts
app.post('/api/bionotes/notes/:id/increment', (req, res) => {
  const noteId = req.params.id;
  const { type } = req.body; // 'view' | 'download'

  const note = db.notes.find((n) => n.id === noteId);
  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  if (type === 'download') {
    note.downloadCount = (note.downloadCount || 0) + 1;
  } else {
    note.viewCount = (note.viewCount || 0) + 1;
  }

  saveDB(db);
  res.json({ success: true, viewCount: note.viewCount, downloadCount: note.downloadCount });
});

// 10. Hierarchy: Update Hierarchy Tree (Developer edit tree, faculty "New shelf")
app.post('/api/bionotes/hierarchy/update', (req, res) => {
  const { hierarchy, userEmail, userRole, shelfName } = req.body;

  const user = db.users.find((u) => u.email.toLowerCase() === userEmail?.toLowerCase());
  if (!user || user.status !== 'active') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  if (user.role !== 'developer' && user.role !== 'faculty') {
    return res.status(403).json({ error: 'Only faculty and developers can add shelves or modify hierarchy.' });
  }

  db.hierarchy = hierarchy;
  saveDB(db);

  logActivity(user.email, 'Hierarchy Shelf Updated', shelfName ? `New shelf added: "${shelfName}"` : 'Academic hierarchy tree updated.');
  res.json({ success: true, hierarchy: db.hierarchy });
});

// 11. Messages: User can send message or submit documents/photos
app.post('/api/bionotes/messages/send', (req, res) => {
  const { 
    senderId, 
    senderEmail, 
    senderName, 
    senderRole, 
    subject, 
    message, 
    attachmentName, 
    attachmentType, 
    attachmentUrl, 
    attachmentSize, 
    department 
  } = req.body;

  if (!message || !senderEmail) {
    return res.status(400).json({ error: 'Message body and sender email are required.' });
  }

  const newMsg: CommunityMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    senderId: senderId || `usr-${Date.now()}`,
    senderEmail,
    senderName: senderName || senderEmail,
    senderRole: senderRole || 'student',
    subject: subject || 'Academic Notes Submission / Inquiry',
    message,
    attachmentName,
    attachmentType,
    attachmentUrl,
    attachmentSize,
    department: department || 'Biotechnology & Life Sciences',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    replies: [],
  };

  db.messages.unshift(newMsg);
  saveDB(db);

  logActivity(senderEmail, 'Community Document / Message Sent', `Subject: "${newMsg.subject}" with attachment: ${attachmentName || 'None'}`);
  res.json({ success: true, message: newMsg });
});

// 12. Messages: Reply to message
app.post('/api/bionotes/messages/:id/reply', (req, res) => {
  const msgId = req.params.id;
  const { senderName, senderRole, text } = req.body;

  const msg = db.messages.find((m) => m.id === msgId);
  if (!msg) {
    return res.status(404).json({ error: 'Message thread not found.' });
  }

  if (!msg.replies) msg.replies = [];
  const reply = {
    id: `rep-${Date.now()}`,
    senderName: senderName || 'Faculty Mentor',
    senderRole: senderRole || 'faculty',
    text,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  msg.replies.push(reply);
  saveDB(db);

  res.json({ success: true, reply });
});

// ----------------- AI STUDY TOOLS ENDPOINT ----------------- //
function generateAcademicFallback(toolType: string, content: string, title: string, options: any = {}) {
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > 20);
  const sampleLines = lines.slice(0, 10);

  if (toolType === 'summary') {
    const mode = options.mode || 'overview';
    const keyTakeaways = sampleLines.slice(0, 5).map((l, idx) => `Key Principle ${idx + 1}: ${l}`);
    
    return {
      title: `Academic Summary: ${title}`,
      mode,
      overview: `Official university syllabus notes on ${title}. Covers fundamental principles, molecular pathways, and critical exam topics taught by the faculty.`,
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : [
        'Fundamental concepts and definitions established in unit syllabus.',
        'Core mechanisms, formulas, and structural relationships explained.',
        'Key differences, comparison frameworks, and time/spatial complexity.',
        'Standard university examination question patterns and key scoring points.',
      ],
      detailedSection: content.slice(0, 1500) + (content.length > 1500 ? '\n\n[Full syllabus notes continued in document reader]' : ''),
      definitions: [
        { term: 'Primary Mechanism', definition: 'The fundamental biological or algorithmic process governing this unit topic.' },
        { term: 'Equilibrium / Invariant', definition: 'The state or condition that must be maintained across all transformations or operations.' },
        { term: 'Asymptotic / Kinetic Limit', definition: 'The theoretical efficiency boundary or rate-limiting step under standard conditions.' },
      ],
    };
  }

  if (toolType === 'quiz') {
    const count = options.count || 5;
    const difficulty = options.difficulty || 'medium';

    const defaultQuizQuestions = [
      {
        id: 'q-fall-1',
        question: `Based on "${title}", what is the primary role or operational invariant described in the faculty notes?`,
        type: 'mcq',
        options: [
          'It preserves structural integrity and enforces specific operational boundaries.',
          'It completely eliminates all energy consumption or time complexity.',
          'It operates without any need for enzymatic or algorithmic verification.',
          'It acts solely as a passive storage buffer with no active regulation.',
        ],
        correctAnswer: 0,
        explanation: 'The faculty notes emphasize that this principle governs stability, active regulation, and structural fidelity.',
        difficulty: 'easy',
      },
      {
        id: 'q-fall-2',
        question: 'True or False: The mechanisms detailed in this unit require specific cofactor conditions or balancing invariants to operate successfully.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'True. In both biochemical pathways and data structure invariants (e.g. AVL balance factors, restriction enzymes with Mg2+), precise conditions are strictly required.',
        difficulty: 'medium',
      },
      {
        id: 'q-fall-3',
        question: `Which phase or step in "${title}" is considered the critical rate-limiting or decision checkpoint?`,
        type: 'mcq',
        options: [
          'The initial sensing and validation phase before irreversible commitment.',
          'The final termination step after all changes have completed.',
          'A random unmonitored transition during execution.',
          'The post-mortem cleanup phase.',
        ],
        correctAnswer: 0,
        explanation: 'Checkpoints and boundary validations occur prior to irreversible state transitions to ensure fidelity.',
        difficulty: 'medium',
      },
    ];

    return {
      title: `AI Practice Quiz: ${title}`,
      difficulty,
      questions: defaultQuizQuestions.slice(0, count),
    };
  }

  if (toolType === 'flashcards') {
    return {
      title: `Flashcards: ${title}`,
      flashcards: [
        {
          id: 'fc-1',
          front: `What is the core definition and primary objective of ${title}?`,
          back: `It provides the theoretical framework and applied mechanisms required to understand the system's structure, dynamics, and regulation as specified in the university curriculum.`,
          topic: 'Foundations',
          difficulty: 'easy',
        },
        {
          id: 'fc-2',
          front: 'What are the essential conditions or inputs required for this process to proceed?',
          back: 'Specific substrates or data elements, regulated environmental parameters, and appropriate catalytic enzymes or algorithmic control logic.',
          topic: 'Mechanisms',
          difficulty: 'medium',
        },
      ],
    };
  }

  return {
    title: `Practice Exam Questions: ${title}`,
    questions: [
      {
        id: 'pq-1',
        question: `Explain in detail the fundamental principles and operational workflow of ${title}. Provide appropriate schematics or step-by-step algorithms.`,
        marks: 10,
        topic: 'Core Theory',
        modelAnswer: `Model Answer Scheme:\n1. Formal Definition (2 Marks)\n2. Structural Components & Invariants (3 Marks)\n3. Step-by-Step Mechanism (3 Marks)\n4. Real-world / Industrial Relevance (2 Marks)`,
        keyPoints: [
          'Correct terminology matching faculty syllabus',
          'Accurate schematic diagrams or pseudo-code',
          'Mathematical derivation or complexity justification',
        ],
      },
    ],
  };
}

app.post('/api/ai/study-tools', async (req, res) => {
  try {
    const { toolType, documentContent, documentTitle, options } = req.body;

    if (!documentContent || !toolType) {
      return res.status(400).json({ error: 'Missing required toolType or documentContent parameter.' });
    }

    if (!geminiApiKey || geminiApiKey === 'MY_GEMINI_API_KEY') {
      const fallback = generateAcademicFallback(toolType, documentContent, documentTitle || 'Unit Study Document', options);
      return res.json({ success: true, source: 'grounded-engine', data: fallback });
    }

    const model = 'gemini-3.8-flash';

    if (toolType === 'summary') {
      const prompt = `You are a university professor preparing concise, high-yield study materials for undergraduate students based on the following lecture notes.
Document Title: ${documentTitle}
Lecture Content:
"""
${documentContent.slice(0, 15000)}
"""

Generate a structured study summary in JSON format with:
- "title": A clear title
- "overview": 2-3 sentences summarizing the core focus of this lecture note
- "keyTakeaways": array of 4 to 6 concise bullet points of the most essential concepts
- "detailedSection": a rich 2-3 paragraph academic explanation of the key mechanisms, theories, and exam focus points
- "definitions": array of objects with "term" and "definition" for 3-5 critical technical terms defined in the text.`;

      const aiResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              overview: { type: Type.STRING },
              keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
              detailedSection: { type: Type.STRING },
              definitions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                  },
                  required: ['term', 'definition'],
                },
              },
            },
            required: ['title', 'overview', 'keyTakeaways', 'detailedSection', 'definitions'],
          },
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      return res.json({ success: true, source: 'gemini', data: parsed });
    }

    if (toolType === 'quiz') {
      const count = options?.count || 5;
      const difficulty = options?.difficulty || 'medium';

      const prompt = `You are an academic examiner creating a university quiz based on this lecture document:
Document Title: ${documentTitle}
Difficulty: ${difficulty}
Total Questions: ${count}
Content:
"""
${documentContent.slice(0, 15000)}
"""

Generate ${count} questions (MCQs with 4 options and True/False). Every question must have an explanation.`;

      const aiResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    type: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                  },
                  required: ['id', 'question', 'type', 'options', 'correctAnswer', 'explanation'],
                },
              },
            },
            required: ['title', 'questions'],
          },
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      if (parsed.questions) {
        parsed.questions.forEach((q: any) => {
          if (q.type === 'mcq' && !isNaN(Number(q.correctAnswer))) {
            q.correctAnswer = Number(q.correctAnswer);
          }
        });
      }
      return res.json({ success: true, source: 'gemini', data: parsed });
    }

    if (toolType === 'flashcards') {
      const prompt = `Generate 4 to 8 flashcards from this text:
Document: ${documentTitle}
Content:
"""
${documentContent.slice(0, 15000)}
"""`;

      const aiResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                  },
                  required: ['id', 'front', 'back', 'topic'],
                },
              },
            },
            required: ['flashcards'],
          },
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      return res.json({ success: true, source: 'gemini', data: parsed });
    }

    const fallback = generateAcademicFallback(toolType, documentContent, documentTitle || 'Unit Study Document', options);
    return res.json({ success: true, source: 'grounded-engine', data: fallback });
  } catch (error: any) {
    console.warn('Gemini API call failed, falling back to grounded engine:', error.message);
    const { toolType, documentContent, documentTitle, options } = req.body;
    const fallback = generateAcademicFallback(toolType, documentContent, documentTitle || 'Unit Study Document', options);
    return res.json({ success: true, source: 'grounded-engine-fallback', data: fallback });
  }
});

// AI study pack route used by BioNotes In-Site Reader
app.post('/api/bionotes/ai/:tool', async (req, res) => {
  try {
    const tool = req.params.tool;
    const { content, noteTitle, summaryType, questionCount, cardCount } = req.body;
    const textContent = content || 'University syllabus materials';

    if (!geminiApiKey || geminiApiKey === 'MY_GEMINI_API_KEY') {
      const fallback = generateAcademicFallback(tool, textContent, noteTitle || 'Unit Study Document', {
        mode: summaryType || 'detailed',
        count: questionCount || 4,
        cardCount: cardCount || 5,
      });
      return res.json({ success: true, source: 'grounded-engine', data: fallback });
    }

    // Forward to internal AI generator or use model
    try {
      const model = 'gemini-2.5-flash';
      if (tool === 'summary') {
        const prompt = `You are a university professor preparing concise study materials for undergraduate students based on the following lecture notes.
Document Title: ${noteTitle}
Lecture Content:
"""
${textContent.slice(0, 10000)}
"""

Provide a JSON object with:
- "executiveSummary": 2-3 sentences summarizing the core focus of this lecture note
- "keyPoints": array of 4 to 5 concise bullet points of the most essential concepts
- "definitions": array of objects with "term" and "definition" for 3 critical technical terms defined in the text.`;

        const aiResponse = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                executiveSummary: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                definitions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING },
                    },
                    required: ['term', 'definition'],
                  },
                },
              },
              required: ['executiveSummary', 'keyPoints', 'definitions'],
            },
          },
        });
        const parsed = JSON.parse(aiResponse.text || '{}');
        return res.json({ success: true, data: parsed });
      }

      if (tool === 'quiz') {
        const prompt = `Create a 4-question university quiz based on this lecture material:
Title: ${noteTitle}
Content: ${textContent.slice(0, 10000)}`;

        const aiResponse = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                    },
                    required: ['question', 'options', 'correctAnswer', 'explanation'],
                  },
                },
              },
              required: ['questions'],
            },
          },
        });
        const parsed = JSON.parse(aiResponse.text || '{}');
        return res.json({ success: true, data: parsed });
      }

      if (tool === 'flashcards') {
        const prompt = `Generate 4 study flashcards (question on front, clear answer on back) for this lecture:
Title: ${noteTitle}
Content: ${textContent.slice(0, 10000)}`;

        const aiResponse = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                cards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      front: { type: Type.STRING },
                      back: { type: Type.STRING },
                    },
                    required: ['front', 'back'],
                  },
                },
              },
              required: ['cards'],
            },
          },
        });
        const parsed = JSON.parse(aiResponse.text || '{}');
        return res.json({ success: true, data: parsed });
      }

      // Default to practice questions
      const prompt = `Generate 3 high-yield university exam practice questions with model guidance for:
Title: ${noteTitle}
Content: ${textContent.slice(0, 10000)}`;

      const aiResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    marks: { type: Type.INTEGER },
                    guidance: { type: Type.STRING },
                  },
                  required: ['question', 'guidance'],
                },
              },
            },
            required: ['questions'],
          },
        },
      });
      const parsed = JSON.parse(aiResponse.text || '{}');
      return res.json({ success: true, data: parsed });
    } catch (modelErr) {
      console.warn('Gemini model call fallback to grounded engine:', modelErr);
      const fallback = generateAcademicFallback(tool, textContent, noteTitle || 'Unit Study Document', {
        mode: summaryType || 'detailed',
        count: questionCount || 4,
        cardCount: cardCount || 5,
      });
      return res.json({ success: true, source: 'grounded-engine-fallback', data: fallback });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal AI error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    library: 'BioNotes – All notes in One Smart Space',
    notesCount: db.notes.length,
    timestamp: new Date().toISOString(),
  });
});

// Start dev server with Vite or serve static dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`BioNotes library server running on http://0.0.0.0:${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
}

startServer().catch((err) => {
  console.error('Failed to start BioNotes server:', err);
  process.exit(1);
});
