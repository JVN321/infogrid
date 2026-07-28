import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const projectRef = process.env.SUPABASE_S3_PROJECT_REF || "mboqwvpjclxqgckivldh";
const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY || "";
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "infogrid-campus-assets";
const region = process.env.SUPABASE_STORAGE_REGION || "ap-south-1";

const endpoint = process.env.SUPABASE_S3_ENDPOINT || `https://${projectRef}.supabase.co/storage/v1/s3`;

export const supabaseS3Client = new S3Client({
  region: region,
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  forcePathStyle: true, // Required for Supabase S3 API compatibility
});

export async function uploadToSupabaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "Supabase S3 credentials not configured. Please set SUPABASE_S3_ACCESS_KEY_ID and SUPABASE_S3_SECRET_ACCESS_KEY in .env file."
    );
  }

  const key = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await supabaseS3Client.send(command);

  return `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${key}`;
}
