import { Subject, SubjectName, MathsErrorCategory, LearningLoopStep } from '../types';

/**
 * EXACT PROJECT MARKER - Stored verbatim in Goals area.
 * NEVER TRANSLATE, DECODE, EXPLAIN, ALTER OR AUTO-CORRECT THAT STRING.
 */
export const EXACT_PROJECT_MARKER = '... .- -- .--. .- .. -.- -.-';

export const ERROR_CATEGORIES: MathsErrorCategory[] = [
  'Concept Error',
  'Formula Forgotten',
  'Calculation Error',
  'Careless Mistake',
  'Question Misunderstood',
  'Time Management',
];

export const LEARNING_LOOP_STEPS: {
  step: LearningLoopStep;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}[] = [
  {
    step: 'retrieve',
    title: '1. Retrieve',
    subtitle: 'Close notes & active recall',
    description: 'Close all books, summaries, and videos. Write down definitions, formulas, and concepts entirely from memory.',
    icon: 'Brain',
  },
  {
    step: 'repair',
    title: '2. Repair',
    subtitle: 'Target missing gaps',
    description: 'Open notes ONLY to verify what you forgot or missed. Focus strictly on repairing the exact blind spots.',
    icon: 'Wrench',
  },
  {
    step: 'produce',
    title: '3. Produce',
    subtitle: 'Solve & write independently',
    description: 'Solve ICSE textbook problems, derivation steps, or numericals with timer on and zero external hints.',
    icon: 'PenTool',
  },
  {
    step: 'check',
    title: '4. Check',
    subtitle: 'Compare with standard answer',
    description: 'Meticulously compare your steps with the trusted textbook solution or marking scheme. Be completely honest with marks.',
    icon: 'CheckCircle2',
  },
  {
    step: 'error_log',
    title: '5. Error Log',
    subtitle: 'Record why marks were lost',
    description: 'Categorize every single lost mark into one of the 6 precise error categories. Never skip logging an error.',
    icon: 'AlertTriangle',
  },
  {
    step: 'reattempt',
    title: '6. Reattempt',
    subtitle: 'Schedule deterministic retrieval',
    description: 'Add to the +1, +3, +7 day revision queue to ensure the repaired neural pathway becomes permanent.',
    icon: 'RotateCcw',
  },
];

export const DEFAULT_WEEKLY_ROTATION: Record<
  string,
  {
    block1: { subject: SubjectName; name: string; minutes: number; hint: string };
    block2: { subject: SubjectName; name: string; minutes: number; hint: string };
    block3: { subject: SubjectName; name: string; minutes: number; hint: string };
    block4: { subject: 'Recall/Error Review' | 'Backlog/Review'; name: string; minutes: number; hint: string };
    isWeekendAcademy: boolean;
    academyNote?: string;
  }
> = {
  Friday: {
    block1: { subject: 'Mathematics', name: 'Morning Maths Focus', minutes: 60, hint: '06:00 AM - 07:00 AM' },
    block2: { subject: 'Physics', name: 'Physics Numericals & Theory', minutes: 60, hint: 'After School Block' },
    block3: { subject: 'English Language', name: 'English Grammar & Writing', minutes: 60, hint: 'Evening Focus' },
    block4: { subject: 'Recall/Error Review', name: 'Daily Recall & Error Log', minutes: 30, hint: 'Night Retrospective' },
    isWeekendAcademy: false,
  },
  Saturday: {
    block1: { subject: 'Mathematics', name: 'Morning Maths Drills', minutes: 60, hint: '08:00 AM - 09:00 AM' },
    block2: { subject: 'Chemistry', name: 'Chemistry Equations & Laws', minutes: 60, hint: '10:00 AM - 11:00 AM' },
    block3: { subject: 'Hindi', name: 'Hindi Literature & Grammar', minutes: 60, hint: '01:00 PM - 02:00 PM' },
    block4: { subject: 'Recall/Error Review', name: 'Error Review (Pre-Academy)', minutes: 30, hint: '02:30 PM - 03:00 PM' },
    isWeekendAcademy: false,
    academyNote: undefined,
  },
  Sunday: {
    block1: { subject: 'Mathematics', name: 'Maths Weekly Mixed Test', minutes: 60, hint: '08:30 AM - 09:30 AM' },
    block2: { subject: 'Biology', name: 'Biology Diagrams & Concepts', minutes: 60, hint: '10:30 AM - 11:30 AM' },
    block3: { subject: 'Computer Applications', name: 'Java / Computer Logic', minutes: 60, hint: '01:00 PM - 02:00 PM' },
    block4: { subject: 'Recall/Error Review', name: 'Weekly Review & Planning', minutes: 30, hint: '02:30 PM - 03:00 PM' },
    isWeekendAcademy: false,
    academyNote: undefined,
  },
  Monday: {
    block1: { subject: 'Mathematics', name: 'Morning Maths Core', minutes: 60, hint: '06:00 AM - 07:00 AM' },
    block2: { subject: 'Biology', name: 'Biology Human Physiology', minutes: 60, hint: 'After School Block' },
    block3: { subject: 'History/Civics', name: 'Civics Constitution & History', minutes: 60, hint: 'Evening Focus' },
    block4: { subject: 'Recall/Error Review', name: 'Daily Recall & Error Log', minutes: 30, hint: 'Night Retrospective' },
    isWeekendAcademy: false,
  },
  Tuesday: {
    block1: { subject: 'Mathematics', name: 'Morning Maths Problem Solving', minutes: 60, hint: '06:00 AM - 07:00 AM' },
    block2: { subject: 'Physics', name: 'Physics Laws of Motion & Pressure', minutes: 60, hint: 'After School Block' },
    block3: { subject: 'Geography', name: 'Geography Map & Climate', minutes: 60, hint: 'Evening Focus' },
    block4: { subject: 'Recall/Error Review', name: 'Daily Recall & Error Log', minutes: 30, hint: 'Night Retrospective' },
    isWeekendAcademy: false,
  },
  Wednesday: {
    block1: { subject: 'Mathematics', name: 'Morning Maths Geometry & Algebra', minutes: 60, hint: '06:00 AM - 07:00 AM' },
    block2: { subject: 'Chemistry', name: 'Gas Laws & Periodic Table', minutes: 60, hint: 'After School Block' },
    block3: { subject: 'English Literature', name: 'Julius Caesar & Poems', minutes: 60, hint: 'Evening Focus' },
    block4: { subject: 'Recall/Error Review', name: 'Daily Recall & Error Log', minutes: 30, hint: 'Night Retrospective' },
    isWeekendAcademy: false,
  },
  Thursday: {
    block1: { subject: 'Mathematics', name: 'Maths Mixed Speed Practice', minutes: 60, hint: '06:00 AM - 07:00 AM' },
    block2: { subject: 'History/Civics', name: 'Mughals & Indian Freedom', minutes: 60, hint: 'After School Block' },
    block3: { subject: 'Hindi', name: 'Hindi Writing & Comprehension', minutes: 60, hint: 'Evening Focus' },
    block4: { subject: 'Backlog/Review', name: 'Weekly Backlog & Weak Spots', minutes: 30, hint: 'Night Retrospective' },
    isWeekendAcademy: false,
  },
};

export const ICSE_SUBJECTS: Subject[] = [
  {
    id: 'sub-maths',
    name: 'Mathematics',
    color: '#3B82F6',
    chapters: [
      { id: 'm-1', subject: 'Mathematics', name: 'Rational and Irrational Numbers', totalTopics: 4, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'm-2', subject: 'Mathematics', name: 'Compound Interest', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'm-3', subject: 'Mathematics', name: 'Expansions', totalTopics: 4, completedTopics: 4, evidenceBasedMastery: true },
      { id: 'm-4', subject: 'Mathematics', name: 'Factorisation', totalTopics: 5, completedTopics: 3, evidenceBasedMastery: false },
      { id: 'm-5', subject: 'Mathematics', name: 'Simultaneous Linear Equations', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'm-6', subject: 'Mathematics', name: 'Indices / Exponents', totalTopics: 3, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'm-7', subject: 'Mathematics', name: 'Logarithms', totalTopics: 4, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'm-8', subject: 'Mathematics', name: 'Triangles (Congruency & Proofs)', totalTopics: 6, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'm-9', subject: 'Mathematics', name: 'Mid-Point and Intercept Theorems', totalTopics: 4, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'm-10', subject: 'Mathematics', name: 'Pythagoras Theorem', totalTopics: 3, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'm-11', subject: 'Mathematics', name: 'Rectilinear Figures', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'm-12', subject: 'Mathematics', name: 'Mensuration: Perimeter and Area', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'm-13', subject: 'Mathematics', name: 'Trigonometrical Ratios', totalTopics: 5, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'm-14', subject: 'Mathematics', name: 'Coordinate Geometry', totalTopics: 4, completedTopics: 0, evidenceBasedMastery: false },
      { id: 'm-15', subject: 'Mathematics', name: 'Statistics', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
    ],
  },
  {
    id: 'sub-physics',
    name: 'Physics',
    color: '#06B6D4',
    chapters: [
      { id: 'p-1', subject: 'Physics', name: 'Measurements and Experimentation', totalTopics: 3, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'p-2', subject: 'Physics', name: 'Motion in One Dimension', totalTopics: 5, completedTopics: 3, evidenceBasedMastery: false },
      { id: 'p-3', subject: 'Physics', name: 'Laws of Motion', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'p-4', subject: 'Physics', name: 'Pressure in Fluids and Atmospheric Pressure', totalTopics: 4, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'p-5', subject: 'Physics', name: 'Upthrust in Fluids & Archimedes Principle', totalTopics: 4, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'p-6', subject: 'Physics', name: 'Heat and Energy', totalTopics: 4, completedTopics: 0, evidenceBasedMastery: false },
      { id: 'p-7', subject: 'Physics', name: 'Reflection of Light', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'p-8', subject: 'Physics', name: 'Propagation of Sound Waves', totalTopics: 3, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'p-9', subject: 'Physics', name: 'Current Electricity', totalTopics: 4, completedTopics: 0, evidenceBasedMastery: false },
    ],
  },
  {
    id: 'sub-chemistry',
    name: 'Chemistry',
    color: '#10B981',
    chapters: [
      { id: 'c-1', subject: 'Chemistry', name: 'Matter and its Composition', totalTopics: 3, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'c-2', subject: 'Chemistry', name: 'Study of Gas Laws (Boyle & Charles)', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'c-3', subject: 'Chemistry', name: 'Elements, Compounds and Mixtures', totalTopics: 4, completedTopics: 4, evidenceBasedMastery: true },
      { id: 'c-4', subject: 'Chemistry', name: 'The Structure of the Atom', totalTopics: 4, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'c-5', subject: 'Chemistry', name: 'Periodic Table and Periodic Trends', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'c-6', subject: 'Chemistry', name: 'Study of the First Element: Hydrogen', totalTopics: 4, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'c-7', subject: 'Chemistry', name: 'Water & Hardness of Water', totalTopics: 4, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'c-8', subject: 'Chemistry', name: 'Chemical Bonding (Electrovalent & Covalent)', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
    ],
  },
  {
    id: 'sub-biology',
    name: 'Biology',
    color: '#84CC16',
    chapters: [
      { id: 'b-1', subject: 'Biology', name: 'Introducing Biology & Cell', totalTopics: 4, completedTopics: 4, evidenceBasedMastery: true },
      { id: 'b-2', subject: 'Biology', name: 'Plant and Animal Tissues', totalTopics: 4, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'b-3', subject: 'Biology', name: 'The Flower: Structure and Function', totalTopics: 3, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'b-4', subject: 'Biology', name: 'Pollination and Fertilisation', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'b-5', subject: 'Biology', name: 'Respiration in Plants', totalTopics: 3, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'b-6', subject: 'Biology', name: 'Nutritive and Digestive System', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'b-7', subject: 'Biology', name: 'Skin: The Jack of all Trades', totalTopics: 3, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'b-8', subject: 'Biology', name: 'The Respiratory System', totalTopics: 4, completedTopics: 1, evidenceBasedMastery: false },
    ],
  },
  {
    id: 'sub-eng-lang',
    name: 'English Language',
    color: '#F59E0B',
    chapters: [
      { id: 'el-1', subject: 'English Language', name: 'Essay Writing (Descriptive / Narrative)', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'el-2', subject: 'English Language', name: 'Letter Writing (Formal & Informal)', totalTopics: 3, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'el-3', subject: 'English Language', name: 'Notice and Email Writing', totalTopics: 3, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'el-4', subject: 'English Language', name: 'Comprehension and Précis', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'el-5', subject: 'English Language', name: 'Grammar: Prepositions & Tenses', totalTopics: 6, completedTopics: 3, evidenceBasedMastery: false },
    ],
  },
  {
    id: 'sub-eng-lit',
    name: 'English Literature',
    color: '#D97706',
    chapters: [
      { id: 'elit-1', subject: 'English Literature', name: 'Drama: Julius Caesar - Act I', totalTopics: 4, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'elit-2', subject: 'English Literature', name: 'Drama: Julius Caesar - Act II', totalTopics: 4, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'elit-3', subject: 'English Literature', name: 'Treasure Chest: Selected Poems', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'elit-4', subject: 'English Literature', name: 'Treasure Chest: Short Stories', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
    ],
  },
  {
    id: 'sub-hist',
    name: 'History/Civics',
    color: '#EC4899',
    chapters: [
      { id: 'h-1', subject: 'History/Civics', name: 'Civics: Our Constitution & Salient Features', totalTopics: 4, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'h-2', subject: 'History/Civics', name: 'Civics: Elections & Political Parties', totalTopics: 3, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'h-3', subject: 'History/Civics', name: 'History: The Harappan Civilization', totalTopics: 4, completedTopics: 4, evidenceBasedMastery: true },
      { id: 'h-4', subject: 'History/Civics', name: 'History: The Vedic Period', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'h-5', subject: 'History/Civics', name: 'History: Jainism and Buddhism', totalTopics: 3, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'h-6', subject: 'History/Civics', name: 'History: The Mauryan Empire', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'h-7', subject: 'History/Civics', name: 'History: The Mughal Empire', totalTopics: 5, completedTopics: 1, evidenceBasedMastery: false },
    ],
  },
  {
    id: 'sub-geo',
    name: 'Geography',
    color: '#14B8A6',
    chapters: [
      { id: 'g-1', subject: 'Geography', name: 'Earth as a Planet & Latitudes / Longitudes', totalTopics: 4, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'g-2', subject: 'Geography', name: 'Rotation and Revolution', totalTopics: 3, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'g-3', subject: 'Geography', name: 'Earth Structure & Landforms', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'g-4', subject: 'Geography', name: 'Volcanoes and Earthquakes', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'g-5', subject: 'Geography', name: 'Atmosphere, Insolation & Pressure Belts', totalTopics: 5, completedTopics: 1, evidenceBasedMastery: false },
      { id: 'g-6', subject: 'Geography', name: 'World Map Work', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
    ],
  },
  {
    id: 'sub-hindi',
    name: 'Hindi',
    color: '#8B5CF6',
    chapters: [
      { id: 'hi-1', subject: 'Hindi', name: 'Sahitya Sagar: Stories', totalTopics: 5, completedTopics: 3, evidenceBasedMastery: false },
      { id: 'hi-2', subject: 'Hindi', name: 'Sahitya Sagar: Poems', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'hi-3', subject: 'Hindi', name: 'Vyakaran: Muhavare, Vilom, Ashuddh Shodhan', totalTopics: 5, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'hi-4', subject: 'Hindi', name: 'Nibandh and Patra Lekhan', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
    ],
  },
  {
    id: 'sub-comp',
    name: 'Computer Applications',
    color: '#6366F1',
    chapters: [
      { id: 'ca-1', subject: 'Computer Applications', name: 'Introduction to OOP Concepts', totalTopics: 4, completedTopics: 4, evidenceBasedMastery: true },
      { id: 'ca-2', subject: 'Computer Applications', name: 'Elementary Concept of Objects and Classes', totalTopics: 4, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'ca-3', subject: 'Computer Applications', name: 'Values and Data Types in Java', totalTopics: 4, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'ca-4', subject: 'Computer Applications', name: 'Operators in Java and Expressions', totalTopics: 5, completedTopics: 3, evidenceBasedMastery: false },
      { id: 'ca-5', subject: 'Computer Applications', name: 'Input in Java (Scanner Class)', totalTopics: 4, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'ca-6', subject: 'Computer Applications', name: 'Mathematical Library Methods', totalTopics: 3, completedTopics: 3, evidenceBasedMastery: true },
      { id: 'ca-7', subject: 'Computer Applications', name: 'Conditional Constructs (if-else, switch)', totalTopics: 5, completedTopics: 2, evidenceBasedMastery: false },
      { id: 'ca-8', subject: 'Computer Applications', name: 'Iterative Constructs (Loops in Java)', totalTopics: 5, completedTopics: 1, evidenceBasedMastery: false },
    ],
  },
];

export const DEFAULT_SKILL_TRACKS: import('../types').SkillTrack[] = [
  {
    id: 'sk-python',
    title: 'Python',
    category: 'Programming & Automation',
    level: 'Beginner -> Intermediate',
    currentTopic: 'Object-Oriented Programming, Scripting & File Processing',
    resourceList: [
      'Automate the Boring Stuff with Python',
      'Official Python 3 Documentation & Tutorial',
      'ICSE Computer Java-to-Python Bridge Concepts',
    ],
    practiceTask: 'Build an automated text parser that extracts ICSE syllabus key concepts into JSON format.',
    miniProject: 'CLI Study Streak and Revision Task scheduler script with local JSON persistence.',
    expectedEvidenceType: 'Working Code (executable script, function, or git commit)',
    totalHoursInvested: 12,
    notes: 'Watching videos is not completion. Every session must end with tested, working code.',
  },
  {
    id: 'sk-ai-fundamentals',
    title: 'AI Fundamentals',
    category: 'Artificial Intelligence',
    level: 'Foundational',
    currentTopic: 'Vector Embeddings, Similarity Search & Neural Architectures',
    resourceList: [
      '3Blue1Brown: But what is a neural network?',
      'Fast.ai: Practical Deep Learning for Coders',
      'Jay Alammar: The Illustrated Transformer',
    ],
    practiceTask: 'Manually compute cosine similarity between two 3-dimensional embeddings and explain vector distance.',
    miniProject: 'Build a lightweight semantic search script over ICSE textbook notes.',
    expectedEvidenceType: 'Explanation / Implementation (clear conceptual writeup or mathematical code implementation)',
    totalHoursInvested: 8,
    notes: 'Explain core concepts in your own words without relying on boilerplate definitions.',
  },
  {
    id: 'sk-ai-agents',
    title: 'AI Agents',
    category: 'Artificial Intelligence',
    level: 'Intermediate Practitioner',
    currentTopic: 'ReAct Loop, Tool Schemas, State Memory & Guardrails',
    resourceList: [
      'ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al.)',
      'Agentic Design Patterns (Andrew Ng)',
      'Model Context Protocol & Function Calling Specs',
    ],
    practiceTask: 'Draft a JSON schema for a multi-turn calculator and study-session lookup tool.',
    miniProject: 'Build an autonomous multi-step study planner that checks schedule availability before proposing slots.',
    expectedEvidenceType: 'Working Feature / Spec / Test (executable agent tool, schema spec, or passing test suite)',
    totalHoursInvested: 6,
    notes: 'Agent workflows must include deterministic fallback behavior and schema validation.',
  },
  {
    id: 'sk-robotics-theory',
    title: 'Robotics Theory',
    category: 'Hardware & Robotics',
    level: 'Foundational',
    currentTopic: 'Forward/Inverse Kinematics, Actuators & PID Control Feedback',
    resourceList: [
      'Modern Robotics: Mechanics, Planning, and Control (Lynch & Park)',
      'Brian Douglas: Control Systems Lectures',
      'ROS2 Basics Documentation',
    ],
    practiceTask: 'Derive forward kinematics matrices for a 2-DOF planar robotic arm.',
    miniProject: 'Python or spreadsheet simulation of a PID controller stabilizing a one-dimensional drone hover.',
    expectedEvidenceType: 'Circuit / Logic Sketch or Safe Simulation / Theory Output',
    totalHoursInvested: 4,
    notes: 'Master the underlying physical laws and feedback equations before touching hardware.',
  },
  {
    id: 'sk-electronics',
    title: 'Electronics',
    category: 'Hardware & Robotics',
    level: 'Foundational',
    currentTopic: "Ohm's Law, Kirchhoff's Circuit Laws, Transistors & Logic Gates",
    resourceList: [
      'The Art of Electronics (Horowitz & Hill)',
      'Falstad Circuit Simulator (online)',
      'ICSE Physics: Current Electricity & Practical Circuits',
    ],
    practiceTask: 'Design a voltage divider circuit and calculate exact resistance values for a 5V to 3.3V logic step-down.',
    miniProject: 'Simulate an astable 555-timer square wave generator on Falstad with visual oscilloscope traces.',
    expectedEvidenceType: 'Circuit Schematic / Logic Diagram or Safe Simulation Output',
    totalHoursInvested: 4,
    notes: 'All electronics practice must be conducted safely via simulations or verified low-voltage DC setups.',
  },
  {
    id: 'sk-ai-business',
    title: 'AI Business',
    category: 'Entrepreneurship & Strategy',
    level: 'Foundational',
    currentTopic: 'AI Unit Economics, Value Propositions & Problem Discovery',
    resourceList: [
      'The Mom Test (Rob Fitzpatrick)',
      'Zero to One (Peter Thiel)',
      'Token Economics & API Margin Calculations',
    ],
    practiceTask: 'Draft a spreadsheet comparing API inference costs vs monthly user subscription fees at 1,000 queries.',
    miniProject: '1-page validated business case analyzing an underserved niche problem solvable via AI automation.',
    expectedEvidenceType: 'Offer, Outreach Draft, Landing Page, Proposal or Validated Idea',
    totalHoursInvested: 5,
    notes: 'A business idea is only valid when anchored in genuine customer pain and sound margins.',
  },
  {
    id: 'sk-ai-agency-building',
    title: 'AI Agency Building',
    category: 'Entrepreneurship & Strategy',
    level: 'Practitioner',
    currentTopic: 'Offer Packaging, Client Outreach, Scope of Work (SOW) & SLA',
    resourceList: [
      '$100M Offers (Alex Hormozi)',
      'Agency Workflow Automation Playbooks',
      'Client Onboarding & Retention Frameworks',
    ],
    practiceTask: 'Draft a high-converting cold email pitch and 3-step value proposition for dental/legal practice automation.',
    miniProject: 'Complete 2-page Scope of Work (SOW) including deliverables, timeline, and revision boundaries for an AI workflow.',
    expectedEvidenceType: 'Offer, Outreach Draft, Landing Page, Proposal or Validated Idea',
    totalHoursInvested: 4,
    notes: 'Deliver clear deliverables and tangible time-savings for client workflows.',
  },
  {
    id: 'sk-ai-product-building',
    title: 'AI Product Building',
    category: 'Product Development',
    level: 'Practitioner',
    currentTopic: 'Product Requirements Document (PRD), UX Scoping & Rapid Prototyping',
    resourceList: [
      'Inspired: How to Create Tech Products Customers Love (Marty Cagan)',
      'Refactoring UI (Adam Wathan & Steve Schoger)',
      'Vercel / Next.js AI SDK Documentation',
    ],
    practiceTask: 'Write a comprehensive PRD for an active-recall flashcard generator with user stories and edge cases.',
    miniProject: 'Functional interactive web UI component for student mistake logging with instant validation.',
    expectedEvidenceType: 'Offer, Outreach Draft, Landing Page, Proposal or Validated Idea',
    totalHoursInvested: 5,
    notes: 'Focus on minimal viable scope with rock-solid execution and high user retention.',
  },
  {
    id: 'sk-quantum-physics',
    title: 'Quantum Physics',
    category: 'Advanced Science',
    level: 'Conceptual Foundation',
    currentTopic: 'Wave-Particle Duality, Photoelectric Effect & De Broglie Relation',
    resourceList: [
      'Feynman Lectures on Physics, Vol. 3: Quantum Mechanics',
      'ICSE Physics: Modern Physics Foundations',
      'Quantum: Einstein, Bohr and the Great Debate (Manjit Kumar)',
    ],
    practiceTask: 'Calculate the de Broglie wavelength of an electron moving at 2.0 x 10^6 m/s.',
    miniProject: 'Write a structured 500-word explanation of the Photoelectric experiment explaining why wave theory failed.',
    expectedEvidenceType: 'Explanation, Derivation appropriate to level, or Solved Problem',
    totalHoursInvested: 4,
    notes: 'Every concept must be accompanied by explicit physical interpretations and solved practice numericals.',
  },
  {
    id: 'sk-quantum-mechanics',
    title: 'Quantum Mechanics',
    category: 'Advanced Science',
    level: 'Mathematical Foundations',
    currentTopic: 'Wavefunction Postulate, 1D Infinite Square Well & Superposition',
    resourceList: [
      'Introduction to Quantum Mechanics (David J. Griffiths)',
      'MIT OpenCourseWare 8.04: Quantum Physics I',
      'Quantum Mechanics: The Theoretical Minimum (Leonard Susskind)',
    ],
    practiceTask: 'Normalize the wavefunction psi(x) = A sin(n*pi*x / L) between 0 and L to determine constant A.',
    miniProject: 'Solve and graph the probability density |psi(x)|^2 for ground and first excited states of a particle in a box.',
    expectedEvidenceType: 'Explanation, Derivation appropriate to level, or Solved Problem',
    totalHoursInvested: 4,
    notes: 'Derivations must be calculated step-by-step with boundary conditions and physical units explicitly stated.',
  },
];

export const DEFAULT_POINT_RULES: import('../types').PointRulesConfig = {
  maths60mPoints: 2,
  study35hPoints: 5,
  reading5pPoints: 1,
  workoutPoints: 1,
  skillLabPoints: 1,
  sleepTargetPoints: 1,
};

export const DEFAULT_PERSONAL_REWARDS: import('../types').PersonalRewardItem[] = [
  {
    id: 'rew-1',
    title: '30 Minutes Gaming / Console Session',
    category: 'Gaming',
    costPoints: 6,
    description: 'Guilt-free session of FIFA / tactical gaming after completing morning Maths and core study.',
    requiresParentApproval: false,
    timesRedeemed: 0,
  },
  {
    id: 'rew-2',
    title: '45 Minutes Documentary / Favorite YouTube Video',
    category: 'Video',
    costPoints: 5,
    description: 'Tech, science or football tactical documentary without multitasking.',
    requiresParentApproval: false,
    timesRedeemed: 0,
  },
  {
    id: 'rew-3',
    title: 'Chosen Outdoor Activity / Solo Match Drills',
    category: 'Activity',
    costPoints: 8,
    description: 'Extra park kickabout or specialized free-kick shooting practice session.',
    requiresParentApproval: false,
    timesRedeemed: 0,
  },
  {
    id: 'rew-4',
    title: 'Weekend Privilege (Movie / Late Night Talk / Outing)',
    category: 'Privilege',
    costPoints: 15,
    description: 'Points unlock student academic eligibility; actual execution subject to parent/family agreement.',
    requiresParentApproval: true,
    timesRedeemed: 0,
  },
];
