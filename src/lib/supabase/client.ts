import { createClient } from '@supabase/supabase-js'

// Database type based on schema in ARCHITECTURE.md
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'student' | 'lecturer' | 'class_rep' | 'admin' | 'librarian'
          college?: string
          department?: string
          programmes?: string[]
          level?: string
          avatar_url?: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      files: {
        Row: {
          id: string
          title: string
          course_code: string
          description?: string
          college: string
          department: string
          programmes: string[]
          level: string
          semester: string
          file_type: 'PDF' | 'DOCX' | 'PPTX' | 'PNG' | 'JPG' | 'TXT'
          file_url: string
          storage_path: string
          tags: string[]
          downloads: number
          text_content?: string | null
          uploaded_by?: string | null
          uploader_name?: string
          uploader_role?: string
          material_type?: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['files']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['files']['Insert']>
      }
      books: {
        Row: {
          id: string
          title: string
          author?: string
          description?: string
          college: string
          department: string
          subject?: string
          file_url: string
          storage_path: string
          cover_url?: string
          downloads: number
          text_content?: string | null
          uploaded_by?: string | null
          uploader_name?: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['books']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['books']['Insert']>
      }
      discussion_threads: {
        Row: {
          id: string
          file_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['discussion_threads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['discussion_threads']['Insert']>
      }
      discussion_replies: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          content: string
          is_helpful: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['discussion_replies']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['discussion_replies']['Insert']>
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          file_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookmarks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          link?: string
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      requests: {
        Row: {
          id: string
          requester_id: string
          requester_name: string
          requester_role: string
          target_role: string
          target_id?: string | null
          target_name?: string | null
          type: 'file' | 'book' | 'other'
          title: string
          description?: string | null
          course_code?: string | null
          college?: string | null
          department?: string | null
          status: 'pending' | 'approved' | 'denied'
          response_message?: string | null
          responded_by?: string | null
          responded_at?: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['requests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['requests']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export const createClientSingleton = () => {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}
