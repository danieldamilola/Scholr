import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params

    // Use service role key to bypass RLS — safe because this is server-side only
    // and we only expose a public storage URL, never sensitive data.
    // This also allows General course files (college='General') to be downloaded
    // even though they won't match a user's own college in RLS policies.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch file record
    const { data: file, error } = await supabase
      .from('files')
      .select('file_url, id')
      .eq('id', fileId)
      .single()

    if (error || !file) {
      console.error('Download lookup error:', error?.message, '| fileId:', fileId)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Increment download count
    await supabase.rpc('increment_file_downloads', { p_file_id: fileId })

    // Redirect to the public file URL
    return NextResponse.redirect(file.file_url)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}
