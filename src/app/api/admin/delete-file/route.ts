import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function DELETE(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 503 },
      );
    }

    // ── Step 1: Verify the caller is an authenticated admin ──────────────
    const cookieStore = await cookies();
    const callerClient = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            /* read-only in a Route Handler */
          },
        },
      },
    );

    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();
    if (!caller) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Use service client to read the caller's role (bypasses RLS)
    const serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerProfile } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (callerProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    // ── Step 2: Validate the target fileId ───────────────────────────────
    const { fileId } = await request.json();

    if (!fileId || typeof fileId !== "string") {
      return NextResponse.json(
        { error: "fileId is required." },
        { status: 400 },
      );
    }

    // ── Step 3: Get the file record to retrieve storage path ─────────────
    const { data: fileRecord, error: fetchError } = await serviceClient
      .from("files")
      .select("storage_path")
      .eq("id", fileId)
      .single();

    if (fetchError || !fileRecord) {
      return NextResponse.json(
        { error: "File not found." },
        { status: 404 },
      );
    }

    // ── Step 4: Delete from storage ───────────────────────────────────────
    const { error: storageError } = await serviceClient.storage
      .from("course-materials")
      .remove([fileRecord.storage_path]);

    if (storageError) {
      console.error("Failed to delete file from storage:", storageError);
      // Continue to delete database record even if storage deletion fails
    }

    // ── Step 5: Delete from database (cascades to bookmarks, discussions) ──
    const { error: dbError } = await serviceClient
      .from("files")
      .delete()
      .eq("id", fileId);

    if (dbError) {
      console.error("Failed to delete file from database:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete file error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
