// Mountain Top University Structure and Constants

export const COLLEGES = [
  'College of Basic and Applied Sciences',
  'College of Humanities, Management and Social Sciences',
  'College of Allied Health Sciences',
  'General',
] as const;

export const DEPARTMENTS = {
  'College of Basic and Applied Sciences': [
    'Biochemistry',
    'Biological Sciences',
    'Chemical Sciences',
    'Computer Science and Mathematics',
    'Food Science and Technology',
    'Geosciences',
    'Physics',
  ],
  'College of Humanities, Management and Social Sciences': [
    'Accounting and Finance',
    'Business Administration',
    'Economics',
    'Languages',
    'Mass Communication',
    'Philosophy and Religion',
    'Music',
    'Fine and Applied Arts',
  ],
  'College of Allied Health Sciences': [
    'Nursing Science',
    'Medical Laboratory Science',
    'Biomedical Technology',
    'Public Health',
    'Nutrition and Dietetics',
  ],
  'General': [
    'General Courses',
  ],
} as const;

export const PROGRAMMES = {
  'Biochemistry': ['Biochemistry'],
  'Biological Sciences': ['Biology', 'Microbiology', 'Molecular Genetics and Biotechnology'],
  'Chemical Sciences': ['Chemistry', 'Industrial Chemistry'],
  'Computer Science and Mathematics': ['Computer Science', 'Mathematics', 'Software Engineering', 'Cyber Security'],
  'Food Science and Technology': ['Food Science and Technology'],
  'Geosciences': ['Geology', 'Applied Geophysics'],
  'Physics': ['Physics', 'Physics with Electronics'],
  'Accounting and Finance': ['Accounting', 'Finance', 'Securities and Investment'],
  'Business Administration': ['Business Administration', 'Public Administration', 'Industrial Relations and Personnel Management'],
  'Economics': ['Economics'],
  'Languages': ['English'],
  'Mass Communication': ['Mass Communication'],
  'Philosophy and Religion': ['Religious Studies'],
  'Music': ['Music'],
  'Fine and Applied Arts': ['Fine and Applied Arts'],
  'Nursing Science': ['Nursing Science'],
  'Medical Laboratory Science': ['Medical Laboratory Science'],
  'Biomedical Technology': ['Biomedical Technology'],
  'Public Health': ['Public Health'],
  'Nutrition and Dietetics': ['Nutrition and Dietetics'],
  'General Courses': ['General'],
} as const;

export const LEVELS = ['100', '200', '300', '400', '500'] as const;

export const SEMESTERS = ['First', 'Second'] as const;

export const ALLOWED_FILE_TYPES = {
  PDF: {
    mime: 'application/pdf',
    extension: '.pdf',
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  DOCX: {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx',
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  PPTX: {
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extension: '.pptx',
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  PNG: {
    mime: 'image/png',
    extension: '.png',
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  JPG: {
    mime: 'image/jpeg',
    extension: '.jpg',
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  TXT: {
    mime: 'text/plain',
    extension: '.txt',
    maxSize: 50 * 1024 * 1024, // 50MB
  },
} as const;

export const USER_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'class_rep', label: 'Class Representative' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'admin', label: 'Admin' },
] as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const AI = {
  MAX_FILE_SIZE_FOR_PROCESSING: 20 * 1024 * 1024, // 20MB for AI processing
  TIMEOUT_SECONDS: 9,
  MAX_CHAT_HISTORY_MESSAGES: 6,
} as const;
