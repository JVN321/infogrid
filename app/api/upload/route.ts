import { NextRequest, NextResponse } from "next/server";
import { uploadToSupabaseStorage } from "@/lib/supabaseStorage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try Supabase S3 Storage Upload
    try {
      const url = await uploadToSupabaseStorage(buffer, file.name, file.type);
      return NextResponse.json({ url, success: true });
    } catch (supabaseError: any) {
      console.warn("Supabase S3 Storage Upload Warning:", supabaseError.message);
      
      // Fallback preview mode if Supabase S3 credentials are not configured yet
      // Return a base64 data URL preview for local testing environment
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      return NextResponse.json({
        url: dataUrl,
        success: true,
        isFallback: true,
        message: "Uploaded as preview (Set SUPABASE_S3_* env vars in .env to upload to Supabase Storage Bucket directly).",
      });
    }
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
