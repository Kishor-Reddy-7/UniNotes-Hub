import { Department, Subject, StudyMaterial, DriveFolderNode, SyncLog } from '../types/academic';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-biotech',
    name: 'BTech Biotechnology',
    shortCode: 'BIOTECH',
    icon: 'Dna',
    totalSemesters: 8,
    description: 'Cell biology, genomics, bioprocess engineering, and bioinformatics.',
  },
  {
    id: 'dept-cs',
    name: 'BTech Computer Science & Engineering',
    shortCode: 'CSE',
    icon: 'Cpu',
    totalSemesters: 8,
    description: 'Algorithms, operating systems, cloud systems, artificial intelligence, and databases.',
  },
  {
    id: 'dept-ece',
    name: 'BTech Electronics & Communication',
    shortCode: 'ECE',
    icon: 'Radio',
    totalSemesters: 8,
    description: 'Signals & systems, embedded electronics, VLSI design, and communication networks.',
  },
  {
    id: 'dept-mech',
    name: 'BTech Mechanical Engineering',
    shortCode: 'MECH',
    icon: 'Cog',
    totalSemesters: 8,
    description: 'Thermodynamics, fluid mechanics, CAD/CAM, and robotics.',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // --- Biotech Sem 1 ---
  {
    id: 'sub-bio-101',
    code: 'BIO101',
    name: 'Cell Biology and Genetics',
    departmentId: 'dept-biotech',
    semester: 1,
    credits: 4,
    facultyInCharge: 'Dr. Sunita Sharma (Associate Professor, Dept of Biotech)',
    description: 'Fundamental principles of cellular architecture, organelle functions, cell division cycle, and Mendelian & molecular genetics.',
    units: [
      {
        id: 'unit-bio-101-u1',
        subjectId: 'sub-bio-101',
        unitNumber: 1,
        title: 'Cellular Architecture & Membrane Transport',
        description: 'Prokaryotic vs eukaryotic cell structure, lipid bilayer model, passive/active transport, and cellular organelles.',
        topics: ['Fluid Mosaic Model', 'Endoplasmic Reticulum', 'Mitochondria & Bioenergetics', 'Ion Channels & Osmosis'],
        materialsCount: 2,
      },
      {
        id: 'unit-bio-101-u2',
        subjectId: 'sub-bio-101',
        unitNumber: 2,
        title: 'Cell Cycle, Mitosis & Meiosis',
        description: 'Phases of cell division, spindle assembly checkpoint, cyclins & CDKs, and genetic recombination during meiosis.',
        topics: ['Mitosis Phases', 'Synaptonemal Complex', 'Checkpoints G1/S/M', 'Cancer & Loss of Cell Cycle Control'],
        materialsCount: 2,
      },
      {
        id: 'unit-bio-101-u3',
        subjectId: 'sub-bio-101',
        unitNumber: 3,
        title: 'Mendelian Genetics & Chromosomal Inheritance',
        description: 'Law of segregation, independent assortment, gene interactions, epistasis, and sex-linked inheritance.',
        topics: ['Monohybrid & Dihybrid Crosses', 'Incomplete Dominance', 'Linkage & Crossing Over', 'Pedigree Analysis'],
        materialsCount: 1,
      },
    ],
  },
  {
    id: 'sub-bio-102',
    code: 'BIO102',
    name: 'Fundamentals of Biotechnology',
    departmentId: 'dept-biotech',
    semester: 1,
    credits: 3,
    facultyInCharge: 'Dr. K. V. Rao (Head, Biotechnology Labs)',
    description: 'Introduction to recombinant DNA technology, cloning vectors, host systems, and applications in industry and medicine.',
    units: [
      {
        id: 'unit-bio-102-u1',
        subjectId: 'sub-bio-102',
        unitNumber: 1,
        title: 'Recombinant DNA Tools & Enzymes',
        description: 'Restriction endonucleases, DNA ligases, alkaline phosphatase, plasmids, and bacteriophage vectors.',
        topics: ['Type II Restriction Enzymes', 'pBR322 & pUC19 Vectors', 'Transformation Methods', 'Blue-White Colony Screening'],
        materialsCount: 2,
      },
      {
        id: 'unit-bio-102-u2',
        subjectId: 'sub-bio-102',
        unitNumber: 2,
        title: 'Bioprocess Engineering & Fermentation',
        description: 'Bioreactor design, batch vs continuous fermentation, aeration, scale-up, and downstream product recovery.',
        topics: ['CSTR Bioreactors', 'KLa Oxygen Transfer', 'Downstream Centrifugation', 'Industrial Enzymes'],
        materialsCount: 1,
      },
    ],
  },
  {
    id: 'sub-bio-103',
    code: 'MAT101',
    name: 'Mathematics for Life Sciences',
    departmentId: 'dept-biotech',
    semester: 1,
    credits: 3,
    facultyInCharge: 'Prof. Ananya Sen',
    description: 'Calculus, differential equations in biological growth models, and biostatistics.',
    units: [
      {
        id: 'unit-bio-103-u1',
        subjectId: 'sub-bio-103',
        unitNumber: 1,
        title: 'Differential Calculus & Microbial Growth Curves',
        description: 'Rate of change, Monod growth model, exponential phase modeling, and derivative applications.',
        topics: ['Limits and Continuity', 'Logarithmic Derivatives', 'Doubling Time Equations', 'Optimization of Harvest Time'],
        materialsCount: 1,
      },
    ],
  },

  // --- CSE Sem 1 ---
  {
    id: 'sub-cs-101',
    code: 'CS101',
    name: 'Programming & Problem Solving in C',
    departmentId: 'dept-cs',
    semester: 1,
    credits: 4,
    facultyInCharge: 'Prof. Arvind Nambiar',
    description: 'Control flow, pointers, dynamic memory allocation, structures, and file handling.',
    units: [
      {
        id: 'unit-cs-101-u1',
        subjectId: 'sub-cs-101',
        unitNumber: 1,
        title: 'Control Flow, Arrays & Functions',
        description: 'Conditional statements, iterative loops, multi-dimensional arrays, passing arrays to functions, recursion.',
        topics: ['Conditionals & Loops', '2D Array Matrices', 'Recursive Call Stack', 'Variable Scope'],
        materialsCount: 1,
      },
      {
        id: 'unit-cs-101-u2',
        subjectId: 'sub-cs-101',
        unitNumber: 2,
        title: 'Pointers & Dynamic Memory Management',
        description: 'Pointer arithmetic, pointers to pointers, malloc/calloc/realloc/free, memory leaks, and segmentation faults.',
        topics: ['Address Operator & Dereference', 'Heap vs Stack', 'Dynamic Arrays', 'Dangling Pointers'],
        materialsCount: 1,
      },
    ],
  },

  // --- CSE Sem 2 ---
  {
    id: 'sub-cs-201',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    departmentId: 'dept-cs',
    semester: 2,
    credits: 4,
    facultyInCharge: 'Dr. Ramesh Gupta (Senior Professor, Algorithms)',
    description: 'Linear & non-linear data structures, asymptotic notation, balanced search trees, graph algorithms, and sorting.',
    units: [
      {
        id: 'unit-cs-201-u1',
        subjectId: 'sub-cs-201',
        unitNumber: 1,
        title: 'Linear Data Structures: Stacks, Queues & Linked Lists',
        description: 'Singly and doubly linked lists, circular queues, infix to postfix conversion, stack evaluation.',
        topics: ['Linked List Operations', 'Stack Infix/Postfix', 'Deque and Priority Queue', 'Memory Complexity'],
        materialsCount: 2,
      },
      {
        id: 'unit-cs-201-u2',
        subjectId: 'sub-cs-201',
        unitNumber: 2,
        title: 'Trees & Balanced Search Trees',
        description: 'Binary trees, BST insertions/deletions, AVL self-balancing rotations, B-Trees for database indexing.',
        topics: ['Tree Traversals (Inorder/Pre/Post)', 'AVL Balance Factors', 'LL/RR/LR/RL Rotations', 'Heap Sort'],
        materialsCount: 2,
      },
      {
        id: 'unit-cs-201-u3',
        subjectId: 'sub-cs-201',
        unitNumber: 3,
        title: 'Graph Algorithms & Shortest Paths',
        description: 'Adjacency list representations, BFS, DFS, Dijkstra shortest path, Bellman-Ford, Kruskal minimum spanning tree.',
        topics: ['Graph Traversal BFS/DFS', 'Dijkstra Priority Queue Implementation', 'Union-Find Disjoint Set', 'Topological Sort'],
        materialsCount: 1,
      },
    ],
  },
  {
    id: 'sub-cs-202',
    code: 'CS202',
    name: 'Database Management Systems',
    departmentId: 'dept-cs',
    semester: 2,
    credits: 4,
    facultyInCharge: 'Prof. Shalini Verma',
    description: 'Relational algebra, SQL, normalization (1NF to BCNF), ACID transactions, and concurrency control.',
    units: [
      {
        id: 'unit-cs-202-u1',
        subjectId: 'sub-cs-202',
        unitNumber: 1,
        title: 'Relational Model & SQL Query Optimization',
        description: 'ER diagrams, relational schemas, primary/foreign keys, joins, subqueries, group by, indexing.',
        topics: ['Entity Relationship Design', 'Complex SQL Joins', 'B-Tree Indexing in Databases', 'Query Execution Plans'],
        materialsCount: 1,
      },
      {
        id: 'unit-cs-202-u2',
        subjectId: 'sub-cs-202',
        unitNumber: 2,
        title: 'Normalization & Functional Dependencies',
        description: 'Anomalies in unnormalized databases, Armstrong axioms, 1NF, 2NF, 3NF, BCNF loss-less join decomposition.',
        topics: ['Functional Dependency Closure', 'Canonical Cover', '3NF vs BCNF Comparison', 'Multi-valued Dependencies'],
        materialsCount: 1,
      },
    ],
  },
];

export const INITIAL_STUDY_MATERIALS: StudyMaterial[] = [
  // --- Biotech Cell Biology Unit 1 ---
  {
    id: 'mat-bio-u1-1',
    title: 'Cellular Architecture & Membrane Transport Detailed Lecture Notes',
    fileName: 'GMU_Bio101_Unit1_CellArchitecture_LectureNotes.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: '3.8 MB',
    lastModified: '2026-10-10 14:32',
    facultyAuthor: 'Dr. Sunita Sharma, Dept of Biotech',
    departmentId: 'dept-biotech',
    semester: 1,
    subjectId: 'sub-bio-101',
    unitId: 'unit-bio-101-u1',
    driveFileId: '1DRV_GMU_BIO101_U1_001',
    driveFolderId: '1FLD_GMU_BIO_SEM1_BIO101_U1',
    webViewLink: 'https://drive.google.com/file/d/1DRV_GMU_BIO101_U1_001/view',
    webContentLink: 'https://drive.google.com/uc?id=1DRV_GMU_BIO101_U1_001&export=download',
    syncStatus: 'synced',
    downloadCount: 142,
    tags: ['Core Syllabus', 'Fluid Mosaic Model', 'Faculty Official', 'Midterm Prep'],
    content: `
GM UNIVERSITY - DEPARTMENT OF BIOTECHNOLOGY
COURSE: BIO101 - Cell Biology and Genetics
UNIT 1: Cellular Architecture and Membrane Transport
Instructor: Dr. Sunita Sharma

1. Overview of Cell Organization:
All living cells are classified into prokaryotic and eukaryotic categories. Prokaryotic cells (bacteria and archaea) lack a membrane-bound nucleus and membrane-bound organelles. Their genetic material is located in a nucleoid region. Eukaryotic cells possess a distinct nucleus surrounded by a double-membrane envelope and specialized organelles such as mitochondria, endoplasmic reticulum (ER), Golgi apparatus, and lysosomes.

2. Plasma Membrane Structure - The Fluid Mosaic Model (Singer & Nicolson, 1972):
The plasma membrane is an amphipathic phospholipid bilayer with embedded integral (transmembrane) and peripheral proteins.
- Phospholipid bilayer: Hydrophilic phosphate heads face the aqueous extracellular and cytosolic environments; hydrophobic fatty acyl hydrocarbon tails face inward.
- Cholesterol molecules: Intercalated among phospholipids; acts as a bidirectional membrane fluidity buffer. At high temperatures, cholesterol reduces fluidity by restraining phospholipid motion. At low temperatures, it hinders close packing of fatty acid chains, preventing membrane crystallization.
- Membrane Carbohydrates: Glycoproteins and glycolipids extend outward from the outer leaflet forming the glycocalyx, essential for cell-cell recognition and immunological signaling.

3. Mechanisms of Membrane Transport:
- Passive Transport (Down electrochemical gradient, ΔG < 0, requires no metabolic ATP hydrolysis):
  a. Simple Diffusion: Movement of small, nonpolar molecules (O2, CO2, N2, steroid hormones) directly across the lipid bilayer.
  b. Facilitated Diffusion: Utilizes specific transmembrane channel proteins (e.g., aquaporins for water transport) or carrier proteins (e.g., GLUT1 glucose transporter). Exhibits saturation kinetics following Michaelis-Menten principles.
- Active Transport (Against electrochemical gradient, ΔG > 0, coupled to energy source):
  a. Primary Active Transport: Direct ATP hydrolysis drives ion translocation. Canonical example: Na+/K+ ATPase pump. In each catalytic cycle, it hydrolyzes 1 ATP molecule to export 3 Na+ ions out of the cell and import 2 K+ ions into the cytosol, generating an electrogenic resting membrane potential (-70 mV in neurons).
  b. Secondary Active Transport (Coupled Transport): Utilizes the ion gradient established by primary active transport. E.g., SGLT1 Na+/glucose symporter in intestinal epithelial cells.
- Endocytosis and Exocytosis: Bulk transport of macromolecules via vesicle budding and fusion. Pinocytosis ('cell drinking'), Phagocytosis ('cell eating'), and Receptor-Mediated Endocytosis (clathrin-coated pits).

4. Endoplasmic Reticulum and Golgi Trafficking:
- Rough ER: Studded with 80S ribosomes; site of synthesis and initial co-translational N-linked glycosylation for membrane, lysosomal, and secretory proteins.
- Smooth ER: Synthesis of lipids, phospholipids, and steroid hormones; detoxification of xenobiotics via cytochrome P450 enzymes; storage and release of Ca2+ ions in sarcoplasmic reticulum of muscle cells.
- Golgi Apparatus: Cis-Golgi network receives transition vesicles from ER; medial cisternae modify oligosaccharide chains; trans-Golgi network sorts and packages proteins into secretor vesicles or lysosomes.

Exam Focus Points:
- Explain why the Na+/K+ pump is considered electrogenic.
- Compare simple diffusion vs facilitated diffusion kinetics.
- Detail the structural adaptations that allow integral membrane proteins to span hydrophobic lipid bilayers (alpha-helices with hydrophobic residues like leucine, valine, isoleucine).
`,
  },
  {
    id: 'mat-bio-u1-2',
    title: 'Cell Organelles & Bioenergetics Visual Presentation Slides',
    fileName: 'GMU_Bio101_Mitochondria_Chloroplasts_Slides.pdf',
    fileType: 'slides',
    mimeType: 'application/pdf',
    fileSize: '4.5 MB',
    lastModified: '2026-10-12 11:15',
    facultyAuthor: 'Dr. Sunita Sharma, Dept of Biotech',
    departmentId: 'dept-biotech',
    semester: 1,
    subjectId: 'sub-bio-101',
    unitId: 'unit-bio-101-u1',
    driveFileId: '1DRV_GMU_BIO101_U1_002',
    driveFolderId: '1FLD_GMU_BIO_SEM1_BIO101_U1',
    webViewLink: 'https://drive.google.com/file/d/1DRV_GMU_BIO101_U1_002/view',
    webContentLink: 'https://drive.google.com/uc?id=1DRV_GMU_BIO101_U1_002&export=download',
    syncStatus: 'synced',
    downloadCount: 98,
    tags: ['Slides', 'Mitochondria', 'ATP Synthase', 'Endosymbiotic Theory'],
    content: `
GM UNIVERSITY BIOTECHNOLOGY - SLIDE PRESENTATION
Topic: Mitochondria Structure, Chemiosmosis & Endosymbiotic Theory

Slide 1: Title & Agenda
- Double membrane structure of Mitochondria
- Inner mitochondrial membrane (IMM) cristae architecture
- The Electron Transport Chain (ETC): Complexes I to IV
- Chemiosmotic ATP synthesis by Fo-F1 ATP Synthase
- Evolutionary origins: Lynn Margulis Endosymbiotic Hypothesis

Slide 2: Mitochondrial Ultrastructure
- Outer Membrane: Contains large pore-forming proteins called Porins (permeable to molecules < 5000 Da).
- Intermembrane Space: High proton concentration (H+) generated during ETC electron transfer.
- Inner Membrane: Highly impermeable, folded into cristae to maximize surface area; contains cardiolipin (diphosphatidylglycerol) and ETC complexes.
- Matrix: Contains circular double-stranded mtDNA, 70S mitochondrial ribosomes, and Krebs cycle enzymes (citrate synthase, isocitrate dehydrogenase).

Slide 3: Chemiosmotic Coupling (Peter Mitchell Hypothesis)
- Electrons derived from NADH and FADH2 flow down redox potentials through Complex I (NADH dehydrogenase), Complex II (Succinate dehydrogenase), Complex III (Cytochrome bc1), and Complex IV (Cytochrome c oxidase).
- Final electron acceptor: Molecular Oxygen (O2), reduced to water: O2 + 4H+ + 4e- -> 2H2O.
- Proton motive force (PMF) = Electrical membrane potential (ΔΨ) + Chemical pH gradient (ΔpH).
- F0-F1 ATP Synthase: Protons flow through F0 rotor ring causing rotation of the gamma stalk in F1 headpiece, driving ADP + Pi -> ATP conformational changes (Open, Loose, Tight states).

Slide 4: Endosymbiotic Evidence
1. Mitochondria possess autonomous circular DNA lacking histone octamers, similar to alpha-proteobacteria.
2. Binary fission division independent of nuclear mitosis.
3. 70S ribosomes inhibited by chloramphenicol and streptomycin, unlike 80S cytosolic ribosomes.
4. Double membrane: Inner membrane resembles bacterial plasma membrane; outer membrane represents host phagocytic vesicle.
`,
  },

  // --- Biotech Cell Biology Unit 2 ---
  {
    id: 'mat-bio-u2-1',
    title: 'Cell Cycle Control, Cyclins & Mitotic Checkpoints Comprehensive Handout',
    fileName: 'GMU_Bio101_Unit2_Mitosis_Meiosis_Checkpoints.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: '5.1 MB',
    lastModified: '2026-10-14 09:45',
    facultyAuthor: 'Dr. Sunita Sharma, Dept of Biotech',
    departmentId: 'dept-biotech',
    semester: 1,
    subjectId: 'sub-bio-101',
    unitId: 'unit-bio-101-u2',
    driveFileId: '1DRV_GMU_BIO101_U2_001',
    driveFolderId: '1FLD_GMU_BIO_SEM1_BIO101_U2',
    webViewLink: 'https://drive.google.com/file/d/1DRV_GMU_BIO101_U2_001/view',
    webContentLink: 'https://drive.google.com/uc?id=1DRV_GMU_BIO101_U2_001&export=download',
    syncStatus: 'synced',
    downloadCount: 167,
    tags: ['Mitosis', 'Checkpoints', 'p53', 'Cyclin-CDK', 'Exam Note'],
    content: `
GM UNIVERSITY - DEPARTMENT OF BIOTECHNOLOGY
COURSE: BIO101 - Cell Biology & Genetics
UNIT 2: Cell Cycle, Mitosis, Meiosis and Checkpoint Regulation
Instructor: Dr. Sunita Sharma

1. Phases of the Eukaryotic Cell Cycle:
The eukaryotic cell cycle comprises Interphase (G1, S, G2 phases) and M phase (Mitosis and Cytokinesis).
- G1 Phase (Gap 1): Intensive biosynthesis of proteins and RNA; cell doubles in size; synthesis of nucleotide precursors.
- S Phase (Synthesis): Precise replication of nuclear DNA from 2C to 4C content (ploidy remains 2n). Centrosome duplication occurs in cytoplasm. Histone proteins are actively synthesized.
- G2 Phase (Gap 2): Synthesis of tubulin dimers for mitotic spindle construction; mitochondrial multiplication; DNA damage repair surveillance.
- M Phase: Nuclear division (Karyokinesis) followed by cytoplasmic cleavage (Cytokinesis).

2. Mitosis Stages:
a. Prophase: Chromatin condensation into distinct sister chromatids joined at centromeres by cohesin complexes; centrosomes migrate to opposite cellular poles; nucleolus disassembles.
b. Prometaphase: Nuclear envelope breakdown triggered by phosphorylation of nuclear lamins by Cyclin B-CDK1; kinetochores assemble on centromeric heterochromatin; kinetochore microtubules capture chromosomes.
c. Metaphase: Chromosomes align along the equatorial metaphase plate in bi-oriented fashion. Equal tension from both spindle poles is sensed by mitotic checkpoint complex (MCC).
d. Anaphase: Separase enzyme becomes activated upon ubiquitin-mediated degradation of Securin by APC/C (Anaphase Promoting Complex/Cyclosome). Separase cleaves cohesin rings. Sister chromatids synchronously separate and move toward spindle poles (Anaphase A: microtubule depolymerization at kinetochores; Anaphase B: spindle elongation via kinesin motor sliding).
e. Telophase: Decondensation of chromosomes; reassembly of nuclear envelopes around daughter nuclei; nucleoli reform; spindle depolymerizes.
f. Cytokinesis: In animal cells, an actin-myosin II contractile ring pinches the plasma membrane producing a cleavage furrow. In plant cells, Golgi-derived vesicles coalesce to form a phragmoplast and cell plate.

3. Molecular Engine: Cyclin-Dependent Kinases (CDKs) & Cyclins:
- CDKs are catalytic serine/threonine protein kinases that remain inactive until bound by regulatory Cyclin subunits.
- G1/S Cyclin (Cyclin D + CDK4/6): Phosphorylates Retinoblastoma protein (pRb). De-repressed E2F transcription factor activates genes for S-phase entry.
- S Cyclin (Cyclin E + CDK2): Fires replication origins and prevents re-replication within the same cycle.
- M Cyclin (Cyclin B + CDK1 / MPF): Drives mitotic entry via Wee1 kinase and Cdc25 phosphatase balancing phosphorylation.

4. Major Cell Cycle Checkpoints:
1. G1/S Checkpoint (Restriction Point): Senses DNA damage. ATM/ATR kinases phosphorylate Chk2, which activates p53 transcription factor. p53 induces p21 (CIP/WAF1 CDK inhibitor), arresting cell cycle to allow DNA excision repair. If damage is irreparable, p53 transactivates pro-apoptotic BAX, triggering programmed cell death (apoptosis).
2. G2/M Checkpoint: Verifies complete DNA replication before permitting chromatin entry into mitosis.
3. Spindle Assembly Checkpoint (SAC): Active during prometaphase/metaphase. Mad2 and BubR1 inhibit APC/C until every single kinetochore achieves amphitelic attachment to spindle microtubules.
`,
  },
  {
    id: 'mat-bio-u2-2',
    title: 'Meiosis Genetic Recombination & Crossing Over Faculty Problem Set',
    fileName: 'GMU_Bio101_Meiosis_CrossingOver_Worksheet.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: '2.1 MB',
    lastModified: '2026-10-15 16:20',
    facultyAuthor: 'Dr. Sunita Sharma, Dept of Biotech',
    departmentId: 'dept-biotech',
    semester: 1,
    subjectId: 'sub-bio-101',
    unitId: 'unit-bio-101-u2',
    driveFileId: '1DRV_GMU_BIO101_U2_002',
    driveFolderId: '1FLD_GMU_BIO_SEM1_BIO101_U2',
    webViewLink: 'https://drive.google.com/file/d/1DRV_GMU_BIO101_U2_002/view',
    webContentLink: 'https://drive.google.com/uc?id=1DRV_GMU_BIO101_U2_002&export=download',
    syncStatus: 'synced',
    downloadCount: 84,
    tags: ['Meiosis', 'Chiasmata', 'Synaptonemal Complex', 'Recombination'],
    content: `
GM UNIVERSITY BIOTECHNOLOGY - PROBLEM SET
Unit 2: Meiosis & Homologous Recombination

Core Questions & Key Concepts:
1. Prophase I Substages (Leptotene, Zygotene, Pachytene, Diplotene, Diakinesis):
- Leptotene: Chromatin threads become visible; telomeres attach to nuclear envelope (bouquet stage).
- Zygotene: Homologous chromosomes initiate synapsis via formation of the zipper-like proteinaceous Synaptonemal Complex (SC).
- Pachytene: Crossing over occurs between non-sister chromatids of homologous chromosomes. Catalyzed by recombination nodules containing Rad51 and Dmc1 recombinases.
- Diplotene: Synaptonemal complex dissolves; homologs remain held together at X-shaped crossover sites called Chiasmata.
- Diakinesis: Terminalization of chiasmata; nucleolus vanishes.

2. Comparison: Mitosis vs Meiosis I:
- Mitosis: Sister chromatids separate in Anaphase; chromosome number is conserved (equational division).
- Meiosis I: Homologous chromosome pairs separate in Anaphase I; reduces chromosome ploidy from diploid (2n) to haploid (n) (reductional division).
`,
  },

  // --- Biotech Recombinant DNA Unit 1 ---
  {
    id: 'mat-bio-rdna-1',
    title: 'Recombinant DNA Enzymes, Cloning Vectors & Host Systems',
    fileName: 'GMU_Bio102_Unit1_rDNA_Vectors_Cloning.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: '4.1 MB',
    lastModified: '2026-10-08 17:10',
    facultyAuthor: 'Dr. K. V. Rao, Head of Biotech Labs',
    departmentId: 'dept-biotech',
    semester: 1,
    subjectId: 'sub-bio-102',
    unitId: 'unit-bio-102-u1',
    driveFileId: '1DRV_GMU_BIO102_U1_001',
    driveFolderId: '1FLD_GMU_BIO_SEM1_BIO102_U1',
    webViewLink: 'https://drive.google.com/file/d/1DRV_GMU_BIO102_U1_001/view',
    webContentLink: 'https://drive.google.com/uc?id=1DRV_GMU_BIO102_U1_001&export=download',
    syncStatus: 'synced',
    downloadCount: 115,
    tags: ['Restriction Enzymes', 'pUC19', 'Blue-White Screening', 'Cloning'],
    content: `
GM UNIVERSITY - DEPARTMENT OF BIOTECHNOLOGY
COURSE: BIO102 - Fundamentals of Biotechnology
UNIT 1: Recombinant DNA Tools, Cloning Vectors and Host Systems
Instructor: Dr. K. V. Rao

1. Restriction Endonucleases (Molecular Scissors):
- Discovered in bacteria as part of the restriction-modification defense system against bacteriophages.
- Type II Restriction Endonucleases: Cleave DNA at specific palindromic recognition sequences (4 to 8 base pairs) in the presence of Mg2+ without requiring ATP.
  - EcoRI: 5'-G^AATTC-3' -> generates 5' overhang sticky ends (cohesive ends).
  - HindIII: 5'-A^AGCTT-3' -> generates 5' cohesive ends.
  - SmaI: 5'-CCC^GGG-3' -> generates blunt ends.
  - BamHI: 5'-G^GATCC-3'.
- Isoschizomers: Restriction enzymes isolated from different organisms that recognize the exact same sequence and cut at the same site (e.g., SphI and BbuI).
- Neoschizomers: Recognize the same sequence but cleave at different positions (e.g., SmaI CCC^GGG vs XmaI C^CCGGG).

2. DNA Modifying Enzymes:
- T4 DNA Ligase: Catalyzes the formation of phosphodiester bonds between adjacent 3'-OH and 5'-phosphate termini. Requires ATP.
- Alkaline Phosphatase (CIP / SAP): Removes 5' terminal phosphate groups from linearized vector DNA, preventing recircularization of empty vectors during ligation.
- Polynucleotide Kinase (T4 PNK): Adds a phosphate group from ATP to 5'-OH termini of oligonucleotides or DNA fragments.

3. Essential Features of a Plasmid Cloning Vector:
a. Origin of Replication (ori): Determines vector host range and copy number per cell (e.g., pUC ori yields 500-700 copies/cell).
b. Selectable Marker Gene: Confers resistance to antibiotics (e.g., ampicillin bla gene, kanamycin kan gene) so only transformed host bacteria survive on selective agar.
c. Multiple Cloning Site (MCS / Polylinker): Short synthetic region containing unique recognition sites for multiple restriction endonucleases.
d. Insertional Inactivation / Screening Marker: E.g., lacZ alpha peptide in pUC vectors. Insertion of foreign gene disrupts lacZ frame, yielding white colonies on LB + Ampicillin + X-gal + IPTG plates (blue colonies harbor non-recombinant empty vectors).

4. Transformation Methods:
- Chemical Competence: CaCl2 treatment on ice creates transient pores in outer membrane; followed by heat-shock at 42°C for 45-90 seconds.
- Electroporation: High-voltage electrical pulse (1.5-2.5 kV) induces temporary membrane permeabilization; highest efficiency for large plasmids.
`,
  },

  // --- CSE Data Structures Unit 2 ---
  {
    id: 'mat-cs-dsa-1',
    title: 'Trees, Binary Search Trees & AVL Rotations Master Notes',
    fileName: 'GMU_CS201_Unit2_BST_AVL_Trees_Notes.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: '3.6 MB',
    lastModified: '2026-10-13 15:40',
    facultyAuthor: 'Dr. Ramesh Gupta, Senior Professor CSE',
    departmentId: 'dept-cs',
    semester: 2,
    subjectId: 'sub-cs-201',
    unitId: 'unit-cs-201-u2',
    driveFileId: '1DRV_GMU_CS201_U2_001',
    driveFolderId: '1FLD_GMU_CSE_SEM2_CS201_U2',
    webViewLink: 'https://drive.google.com/file/d/1DRV_GMU_CS201_U2_001/view',
    webContentLink: 'https://drive.google.com/uc?id=1DRV_GMU_CS201_U2_001&export=download',
    syncStatus: 'synced',
    downloadCount: 210,
    tags: ['AVL Trees', 'Rotations', 'Binary Search Tree', 'Time Complexity', 'Faculty Verified'],
    content: `
GM UNIVERSITY - DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
COURSE: CS201 - Data Structures & Algorithms
UNIT 2: Trees, Binary Search Trees (BST), and AVL Self-Balancing Trees
Instructor: Dr. Ramesh Gupta

1. Binary Tree Definitions & Properties:
A binary tree is a hierarchical data structure where each node has at most two children, referred to as the left child and right child.
- Height of a tree: Number of edges on the longest path from root to a leaf node.
- Depth of a node: Number of edges from root to that node.
- Full Binary Tree: Every node has either 0 or 2 children.
- Complete Binary Tree: All levels are completely filled except possibly the last level, where nodes are as far left as possible.
- In-order traversal: Left -> Root -> Right.
- Pre-order traversal: Root -> Left -> Right.
- Post-order traversal: Left -> Right -> Root.

2. Binary Search Tree (BST) Invariant:
For every node X in the tree:
- All keys in the left subtree of X must be strictly less than key(X).
- All keys in the right subtree of X must be strictly greater than key(X).
Key Property: An In-order traversal of any valid BST produces values in strictly ascending sorted order.
- Average Case Time Complexity: Search, Insert, Delete = O(log n).
- Worst Case Time Complexity: O(n) when elements are inserted in sorted order, degenerating the BST into a skewed linked list.

3. AVL Trees (Adelson-Velsky & Landis, 1962):
An AVL tree is a strictly height-balanced Binary Search Tree.
- Balance Factor (BF) Definition:
  BF(node) = Height(left_subtree) - Height(right_subtree)
- Invariant: For every node in an AVL tree, BF(node) ∈ {-1, 0, +1}.
- If |BF| > 1 after insertion or deletion, the tree is unbalanced and must be restored using rotations in O(1) time.

4. The Four AVL Rotations:
1. LL Rotation (Single Right Rotation):
   - Condition: Inserted node into the Left subtree of the Left child of unbalance node (BF = +2, child BF = +1).
   - Fix: Right rotate around unbalanced node.
2. RR Rotation (Single Left Rotation):
   - Condition: Inserted node into the Right subtree of the Right child (BF = -2, child BF = -1).
   - Fix: Left rotate around unbalanced node.
3. LR Rotation (Double Rotation: Left then Right):
   - Condition: Inserted into the Right subtree of the Left child (BF = +2, child BF = -1).
   - Fix: Perform Left rotation on left child, followed by Right rotation on unbalanced root.
4. RL Rotation (Double Rotation: Right then Left):
   - Condition: Inserted into the Left subtree of the Right child (BF = -2, child BF = +1).
   - Fix: Perform Right rotation on right child, followed by Left rotation on unbalanced root.

Worst-Case Guarantees:
- Height of AVL tree with n nodes is bounded by: h < 1.44 * log2(n + 2) - 0.328.
- Search: O(log n) guaranteed.
- Insertion: O(log n) with at most 1 rotation (or double rotation) needed to restore balance.
- Deletion: O(log n) with up to O(log n) rotations propagated along the ancestor path.
`,
  },
  {
    id: 'mat-cs-dsa-2',
    title: 'Heap Sort, Priority Queues & B-Tree Indexing Reference Slides',
    fileName: 'GMU_CS201_Heap_PriorityQueue_BTree.pdf',
    fileType: 'slides',
    mimeType: 'application/pdf',
    fileSize: '4.8 MB',
    lastModified: '2026-10-15 11:20',
    facultyAuthor: 'Dr. Ramesh Gupta, Senior Professor CSE',
    departmentId: 'dept-cs',
    semester: 2,
    subjectId: 'sub-cs-201',
    unitId: 'unit-cs-201-u2',
    driveFileId: '1DRV_GMU_CS201_U2_002',
    driveFolderId: '1FLD_GMU_CSE_SEM2_CS201_U2',
    webViewLink: 'https://drive.google.com/file/d/1DRV_GMU_CS201_U2_002/view',
    webContentLink: 'https://drive.google.com/uc?id=1DRV_GMU_CS201_U2_002&export=download',
    syncStatus: 'synced',
    downloadCount: 178,
    tags: ['Min-Heap', 'Max-Heap', 'Priority Queue', 'Heapify O(n)'],
    content: `
GM UNIVERSITY CSE - ADVANCED DATA STRUCTURES SLIDES
Topic: Binary Heaps, Priority Queues & B-Trees

Slide 1: Binary Heap Invariants
- A Binary Heap is a complete binary tree stored compactly in an array without pointer overhead.
- Array indexing: For node at index i (0-indexed):
  - Left child: 2*i + 1
  - Right child: 2*i + 2
  - Parent: floor((i - 1) / 2)
- Max-Heap Property: Parent value >= child values.
- Min-Heap Property: Parent value <= child values.

Slide 2: Building a Heap (Heapify Algorithm)
- Bottom-up heapify runs in linear time: O(n), NOT O(n log n).
- Mathematical proof: Sum of (h * n / 2^(h+1)) converges to 2*n operations.
- Extract-Max operation takes O(log n): swap root with last leaf, decrement heap size, sift-down.
- Heap Sort complexity: O(n log n) best, average, and worst-case. In-place sorting algorithm with O(1) auxiliary space.
`,
  },

  // Sample restricted file to test and fulfill permissions rule:
  // "Students must only see files they are authorized to access. Show a useful message when a file is unavailable."
  {
    id: 'mat-cs-restricted-exam',
    title: 'Midterm Examination Solution Key & Faculty Grading Rubric [Restricted]',
    fileName: 'CS201_Midterm_Master_Grading_Rubric_Internal.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: '1.2 MB',
    lastModified: '2026-10-16 18:00',
    facultyAuthor: 'Dr. Ramesh Gupta, Senior Professor CSE',
    departmentId: 'dept-cs',
    semester: 2,
    subjectId: 'sub-cs-201',
    unitId: 'unit-cs-201-u2',
    driveFileId: '1DRV_GMU_RESTRICTED_001',
    driveFolderId: '1FLD_GMU_CSE_SEM2_CS201_U2',
    webViewLink: 'https://drive.google.com/file/d/1DRV_GMU_RESTRICTED_001/view',
    syncStatus: 'permission_restricted',
    isRestricted: true,
    restrictionReason: 'Access Restricted by Faculty. This document is restricted to authenticated GM University Faculty Evaluators. Students cannot view or generate AI study summaries from confidential evaluation rubrics.',
    downloadCount: 0,
    tags: ['Faculty Only', 'Exam Key', 'Confidential'],
    content: 'CONFIDENTIAL FACULTY EVALUATION RUBRIC. ACCESS RESTRICTED.',
  },
];

// Drive folder hierarchy matching the user prompt's GM University Drive specification:
// GM University Drive -> BTech Biotechnology -> Semester 1 -> Cell Biology and Genetics -> Unit 1 ...
export const INITIAL_DRIVE_FOLDER_TREE: DriveFolderNode = {
  id: 'gmu-root',
  name: 'GM University Drive (Shared Academic Drive)',
  type: 'folder',
  children: [
    {
      id: 'fld-biotech',
      name: 'BTech Biotechnology',
      type: 'folder',
      mappedTo: { departmentId: 'dept-biotech' },
      children: [
        {
          id: 'fld-biotech-sem1',
          name: 'Semester 1',
          type: 'folder',
          mappedTo: { departmentId: 'dept-biotech', semester: 1 },
          children: [
            {
              id: 'fld-bio101',
              name: 'Cell Biology and Genetics',
              type: 'folder',
              mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-101' },
              children: [
                {
                  id: 'fld-bio101-u1',
                  name: 'Unit 1 - Cellular Architecture',
                  type: 'folder',
                  mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-101', unitId: 'unit-bio-101-u1' },
                  children: [
                    {
                      id: 'file-bio101-u1-1',
                      name: 'GMU_Bio101_Unit1_CellArchitecture_LectureNotes.pdf',
                      type: 'file',
                      size: '3.8 MB',
                      lastModified: '2026-10-10',
                      mimeType: 'application/pdf',
                      mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-101', unitId: 'unit-bio-101-u1' },
                    },
                    {
                      id: 'file-bio101-u1-2',
                      name: 'GMU_Bio101_Mitochondria_Chloroplasts_Slides.pdf',
                      type: 'file',
                      size: '4.5 MB',
                      lastModified: '2026-10-12',
                      mimeType: 'application/pdf',
                      mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-101', unitId: 'unit-bio-101-u1' },
                    },
                  ],
                },
                {
                  id: 'fld-bio101-u2',
                  name: 'Unit 2 - Mitosis and Meiosis',
                  type: 'folder',
                  mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-101', unitId: 'unit-bio-101-u2' },
                  children: [
                    {
                      id: 'file-bio101-u2-1',
                      name: 'GMU_Bio101_Unit2_Mitosis_Meiosis_Checkpoints.pdf',
                      type: 'file',
                      size: '5.1 MB',
                      lastModified: '2026-10-14',
                      mimeType: 'application/pdf',
                      mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-101', unitId: 'unit-bio-101-u2' },
                    },
                  ],
                },
              ],
            },
            {
              id: 'fld-bio102',
              name: 'Fundamentals of Biotechnology',
              type: 'folder',
              mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-102' },
              children: [
                {
                  id: 'fld-bio102-u1',
                  name: 'Unit 1 - rDNA Tools & Vectors',
                  type: 'folder',
                  mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-102', unitId: 'unit-bio-102-u1' },
                  children: [
                    {
                      id: 'file-bio102-u1-1',
                      name: 'GMU_Bio102_Unit1_rDNA_Vectors_Cloning.pdf',
                      type: 'file',
                      size: '4.1 MB',
                      lastModified: '2026-10-08',
                      mimeType: 'application/pdf',
                      mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-102', unitId: 'unit-bio-102-u1' },
                    },
                  ],
                },
                {
                  id: 'fld-bio102-u2',
                  name: 'Unit 2 - Bioprocess Engineering',
                  type: 'folder',
                  mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-102', unitId: 'unit-bio-102-u2' },
                  children: [],
                },
              ],
            },
            {
              id: 'fld-mat101',
              name: 'Mathematics',
              type: 'folder',
              mappedTo: { departmentId: 'dept-biotech', semester: 1, subjectId: 'sub-bio-103' },
              children: [],
            },
          ],
        },
        {
          id: 'fld-biotech-sem2',
          name: 'Semester 2',
          type: 'folder',
          mappedTo: { departmentId: 'dept-biotech', semester: 2 },
          children: [],
        },
      ],
    },
    {
      id: 'fld-cse',
      name: 'BTech Computer Science',
      type: 'folder',
      mappedTo: { departmentId: 'dept-cs' },
      children: [
        {
          id: 'fld-cse-sem1',
          name: 'Semester 1',
          type: 'folder',
          mappedTo: { departmentId: 'dept-cs', semester: 1 },
          children: [
            {
              id: 'fld-cs101',
              name: 'Programming in C',
              type: 'folder',
              mappedTo: { departmentId: 'dept-cs', semester: 1, subjectId: 'sub-cs-101' },
              children: [],
            },
          ],
        },
        {
          id: 'fld-cse-sem2',
          name: 'Semester 2',
          type: 'folder',
          mappedTo: { departmentId: 'dept-cs', semester: 2 },
          children: [
            {
              id: 'fld-cs201',
              name: 'Data Structures and Algorithms',
              type: 'folder',
              mappedTo: { departmentId: 'dept-cs', semester: 2, subjectId: 'sub-cs-201' },
              children: [
                {
                  id: 'fld-cs201-u2',
                  name: 'Unit 2 - Trees and BST',
                  type: 'folder',
                  mappedTo: { departmentId: 'dept-cs', semester: 2, subjectId: 'sub-cs-201', unitId: 'unit-cs-201-u2' },
                  children: [
                    {
                      id: 'file-cs201-u2-1',
                      name: 'GMU_CS201_Unit2_BST_AVL_Trees_Notes.pdf',
                      type: 'file',
                      size: '3.6 MB',
                      lastModified: '2026-10-13',
                      mimeType: 'application/pdf',
                      mappedTo: { departmentId: 'dept-cs', semester: 2, subjectId: 'sub-cs-201', unitId: 'unit-cs-201-u2' },
                    },
                    {
                      id: 'file-cs201-u2-2',
                      name: 'GMU_CS201_Heap_PriorityQueue_BTree.pdf',
                      type: 'file',
                      size: '4.8 MB',
                      lastModified: '2026-10-15',
                      mimeType: 'application/pdf',
                      mappedTo: { departmentId: 'dept-cs', semester: 2, subjectId: 'sub-cs-201', unitId: 'unit-cs-201-u2' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    // Faculty staging folder with unmapped files ready to be mapped by administrator:
    {
      id: 'fld-staging',
      name: 'Faculty Upload Staging (Pending Mapping)',
      type: 'folder',
      children: [
        {
          id: 'file-unmapped-1',
          name: 'Microbiology_Lab_Techniques_GramStaining.pdf',
          type: 'file',
          size: '2.4 MB',
          lastModified: '2026-10-16 10:15',
          mimeType: 'application/pdf',
        },
        {
          id: 'file-unmapped-2',
          name: 'Operating_Systems_Process_Scheduling_Semaphores.pdf',
          type: 'file',
          size: '3.1 MB',
          lastModified: '2026-10-16 14:20',
          mimeType: 'application/pdf',
        },
        {
          id: 'file-unmapped-3',
          name: 'Digital_Logic_Karnaugh_Maps_SequentialCircuits.pdf',
          type: 'file',
          size: '1.9 MB',
          lastModified: '2026-10-17 08:00',
          mimeType: 'application/pdf',
        },
      ],
    },
  ],
};

export const INITIAL_SYNC_LOGS: SyncLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-17 06:40:12',
    action: 'Google Drive Scheduled Metadata Sync',
    status: 'success',
    details: 'Polled GM University Drive folder root. Checked 18 folders and 24 files. 0 schema conflicts detected.',
    itemsAffected: 6,
  },
  {
    id: 'log-2',
    timestamp: '2026-10-16 18:02:44',
    action: 'Permission Audit & Access Restriction',
    status: 'warning',
    details: 'Flagged CS201_Midterm_Master_Grading_Rubric_Internal.pdf as restricted. Student access revoked.',
    itemsAffected: 1,
  },
  {
    id: 'log-3',
    timestamp: '2026-10-15 11:22:05',
    action: 'Manual Drive Folder Mapping',
    status: 'success',
    details: 'Mapped "Unit 2 - Trees and BST" folder to BTech CSE > Semester 2 > CS201 > Unit 2.',
    itemsAffected: 2,
  },
];
