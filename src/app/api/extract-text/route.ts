import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/extract-text
 * Body: { fileId: string, storagePath: string, fileType: string, bucket: string }
 *
 * Downloads the file from Supabase storage (server-side),
 * extracts text using the appropriate library, and updates the DB record.
 * Running server-side avoids all browser/worker issues with PDF parsing.
 */
export async function POST(request: Request) {
  try {
    const {
      fileId,
      storagePath,
      fileType,
      bucket = "course-materials",
    } = await request.json();

    if (!fileId || !storagePath) {
      return NextResponse.json(
        { error: "fileId and storagePath are required" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error: missing Supabase credentials." },
        { status: 503 },
      );
    }
    // Use service role key to bypass RLS for reading any file
    const supabase = createClient(supabaseUrl, serviceKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(storagePath);

    if (downloadError || !fileData) {
      console.error(
        "Failed to download file for text extraction:",
        downloadError,
      );
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 },
      );
    }

    const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
    const sizeCheck = fileData.size ?? 0;
    if (sizeCheck > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large for text extraction (max 50 MB)." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    let textContent: string | null = null;

    const ext = storagePath.split(".").pop()?.toLowerCase();
    const normalizedType = fileType?.toLowerCase() || "";

    // ── PDF ──────────────────────────────────────────────────
    if (normalizedType.includes("pdf") || ext === "pdf") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(buffer);
        textContent = data.text || null;
      } catch (err) {
        console.error("PDF text extraction failed:", err);
      }
    }

    // ── DOCX ─────────────────────────────────────────────────
    else if (normalizedType.includes("wordprocessingml") || ext === "docx") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        textContent = result.value || null;
      } catch (err) {
        console.error("DOCX text extraction failed:", err);
      }
    }

    // ── TXT ───────────────────────────────────────────────────
    else if (normalizedType.includes("text/plain") || ext === "txt") {
      textContent = buffer.toString("utf-8") || null;
    }

    // ── PPTX ─────────────────────────────────────────────────
    else if (normalizedType.includes("presentationml") || ext === "pptx") {
      try {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(buffer);
        const slideEntries = Object.keys(zip.files)
          .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
          .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] ?? "0", 10);
            const numB = parseInt(b.match(/\d+/)?.[0] ?? "0", 10);
            return numA - numB;
          });

        const slideTexts: string[] = [];
        for (const slidePath of slideEntries) {
          const xml = await zip.files[slidePath].async("string");
          const matches = xml.match(/<a:t(?:\s[^>]*)?>([^<]*)<\/a:t>/g) ?? [];
          const slideText = matches
            .map((tag) => tag.replace(/<[^>]+>/g, "").trim())
            .filter(Boolean)
            .join(" ");
          if (slideText) slideTexts.push(slideText);
        }
        textContent = slideTexts.length > 0 ? slideTexts.join("\n\n") : null;
        const decodeXmlEntities = (s: string) =>
          s
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
        textContent = textContent ? decodeXmlEntities(textContent) : null;
      } catch (err) {
        console.error("PPTX text extraction failed:", err);
      }
    }

    // Truncate to 100 KB — AI context is capped at ~12k chars anyway
    if (textContent && textContent.length > 100_000) {
      textContent = textContent.slice(0, 100_000);
    }

    // Update the file record in the DB with extracted text
    if (textContent) {
      const { error: updateError } = await supabase
        .from("files")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ text_content: textContent } as any)
        .eq("id", fileId);

      if (updateError) {
        console.error("Failed to update text_content in DB:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      extracted: textContent !== null,
      length: textContent?.length ?? 0,
    });
  } catch (err) {
    console.error("extract-text API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
