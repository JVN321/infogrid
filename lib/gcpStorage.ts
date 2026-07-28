import { Storage } from "@google-cloud/storage";

const projectId = process.env.GCP_PROJECT_ID || "";
const clientEmail = process.env.GCP_CLIENT_EMAIL || "";
const privateKey = (process.env.GCP_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const bucketName = process.env.GCP_STORAGE_BUCKET_NAME || "infogrid-campus-assets";
const publicUrl = process.env.GCP_STORAGE_PUBLIC_URL || "";

function getGCPStorageInstance() {
  if (clientEmail && privateKey) {
    return new Storage({
      projectId: projectId || undefined,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
  }
  // Fallback to default ADC (Application Default Credentials) or projectId
  return new Storage({ projectId: projectId || undefined });
}

export async function uploadToGCP(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  if (!projectId && !clientEmail && !process.env.GCP_PRIVATE_KEY && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      "GCP Storage credentials not configured. Please set GCP_PROJECT_ID, GCP_CLIENT_EMAIL, and GCP_PRIVATE_KEY in your .env file."
    );
  }

  const key = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const storage = getGCPStorageInstance();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(key);

  await file.save(fileBuffer, {
    metadata: {
      contentType: contentType,
    },
    resumable: false,
  });

  if (publicUrl) {
    const cleanPublicUrl = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
    return `${cleanPublicUrl}/${key}`;
  }

  return `https://storage.googleapis.com/${bucketName}/${key}`;
}
