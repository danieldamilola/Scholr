import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './client'

export const createServerClient = async () => {
  const cookieStore = await cookies()

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    }
  )
}
