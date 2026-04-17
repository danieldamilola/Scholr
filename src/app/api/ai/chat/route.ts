import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { chatWithFile } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, question, chatHistory = [] } = body;

    if (!fileId || !question) {
      return NextResponse.json(
        { error: "Missing required fields: fileId and question" },
        { status: 400 },
      );
    }

    if (question.length > 2000) {
      return NextResponse.json(
        {
          error: "Question is too long. Please keep it under 2000 characters.",
        },
        { status: 400 },
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured. Please contact the admin." },
        { status: 503 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 503 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: fileData, error: fetchError } = await supabase
      .from("files")
      .select("text_content")
      .eq("id", fileId)
      .single();

    if (fetchError || !fileData) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const textContent = fileData.text_content as string | null;

    if (!textContent || textContent.trim() === "") {
      return NextResponse.json(
        {
          error:
            "This file does not have extractable text content. AI features are not available for this file type.",
        },
        { status: 400 },
      );
    }

    const { response, updatedHistory } = await chatWithFile(
      textContent,
      question,
      chatHistory,
    );

    return NextResponse.json({ response, updatedHistory });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 },
    );
  }
}
