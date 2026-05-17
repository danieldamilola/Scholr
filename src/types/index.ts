export type UserRole =
  | "student"
  | "lecturer"
  | "class_rep"
  | "admin"
  | "librarian";

export type FileType = "PDF" | "DOCX" | "PPTX" | "PNG" | "JPG" | "JPEG" | "TXT";

export type Semester = "First" | "Second";

export type Level = "100" | "200" | "300" | "400" | "500";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  college?: string;
  department?: string;
  programmes?: string[];
  level?: string;
  avatar_url?: string;
  created_at: string;
}

export interface FileRecord {
  id: string;
  title: string;
  course_code: string;
  description?: string;
  college: string;
  department: string;
  programmes: string[];
  level: string;
  semester: string;
  file_type: FileType;
  file_url: string;
  storage_path: string;
  tags: string[];
  downloads: number;
  text_content?: string | null;
  uploaded_by?: string | null;
  uploader_name?: string;
  uploader_role?: string;
  created_at: string;
}

export interface BookRecord {
  id: string;
  title: string;
  author?: string;
  description?: string;
  college: string;
  department: string;
  subject?: string;
  file_url: string;
  storage_path: string;
  cover_url?: string;
  downloads: number;
  text_content?: string | null;
  uploaded_by?: string | null;
  uploader_name?: string;
  created_at: string;
}

export interface DiscussionThread {
  id: string;
  file_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface DiscussionReply {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  is_helpful: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  file_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// Extended types with joins for API responses
export interface FileRecordWithUploader extends FileRecord {
  uploader: UserProfile;
}

export interface DiscussionThreadWithReplies extends DiscussionThread {
  user: UserProfile;
  replies: (DiscussionReply & { user: UserProfile })[];
}

export interface NotificationWithFile extends Notification {
  file?: FileRecord;
}

// Database insert/update payloads
export interface BookInsert {
  title: string;
  author?: string | null;
  description?: string | null;
  college: string;
  department: string;
  subject?: string | null;
  file_url: string;
  storage_path: string;
  cover_url?: string | null;
  text_content?: string | null;
  uploaded_by: string;
  uploader_name: string;
}

export interface BookmarkInsert {
  user_id: string;
  file_id: string;
}

export interface RequestInsert {
  requester_id: string;
  requester_name: string;
  requester_role: string;
  target_role: string;
  target_id?: string | null;
  target_name?: string | null;
  type: string;
  title: string;
  description?: string | null;
  course_code?: string | null;
  college?: string | null;
  department?: string | null;
}

export interface RequestUpdate {
  status: "approved" | "denied";
  response_message?: string | null;
  responded_by: string;
  responded_at: string;
}

export interface NotificationInsert {
  user_id: string;
  message: string;
  link?: string;
}
