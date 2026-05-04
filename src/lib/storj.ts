import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const GARANT_ACCESS = process.env.AWS_ACCESS_GRANT;
const ENDPOINT = process.env.AWS_S3_ENDPOINT;
const BUCKET = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION || "US1";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY_ID || "",
    secretAccessKey: SECRET_ACCESS_KEY || "",
  },
  endpoint: ENDPOINT,
  region: REGION,
  forcePathStyle: true,
});

export async function uploadProfilePicture(file: Buffer | ArrayBuffer, fileName: string) {
  if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET || !ENDPOINT) {
    throw new Error("Configurações do Storj incompletas no .env");
  }

  const buffer = file instanceof ArrayBuffer ? Buffer.from(file) : file;

  // Processamento de imagem com Sharp
  const processedBuffer = await sharp(buffer)
    .resize(400, 400, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 80 })
    .toBuffer();

  const key = `avatars/${uuidv4()}.webp`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: processedBuffer,
      ContentType: "image/webp",
    },
  });

  await upload.done();
  return key;
}

export function getStorjUrl(key: string | null) {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  
  return `https://link.storjshare.io/s/${GARANT_ACCESS}/${BUCKET}/${key}?wrap=0`;
}

export async function deleteFile(key: string) {
  if (!key) return;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    console.error("Erro ao deletar arquivo no Storj:", error);
  }
}
