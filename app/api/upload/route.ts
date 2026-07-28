import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

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

    // Try Cloudflare R2 Upload
    try {
      const url = await uploadToR2(buffer, file.name, file.type);
      return NextResponse.json({ url, success: true });
    } catch (r2Error: any) {
      console.warn("Cloudflare R2 Upload Warning:", r2Error.message);
      
      // Fallback preview mode if R2 keys are not configured yet
      // Return a base64 data URL preview for local testing environment
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      return NextResponse.json({
        url: dataUrl,
        success: true,
        isFallback: true,
        message: "Uploaded as preview (Set CLOUDFLARE_R2_* env vars in .env to upload to R2 Bucket directly).",
      });
    }
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
