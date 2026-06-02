import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_UPLOAD_EXPIRES_SECONDS = 900;
const DEFAULT_GET_EXPIRES_SECONDS = 3600;

export type GarageConfig = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  uploadExpiresSeconds: number;
  getExpiresSeconds: number;
};

const globalForGarage = globalThis as unknown as {
  garageClient: S3Client | undefined;
  garageConfigKey: string | undefined;
};

function parseExpiresSeconds(
  value: string | undefined,
  fallback: number,
): number {
  if (!value?.trim()) return fallback;
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getGarageConfig(): GarageConfig | null {
  const endpoint = process.env.GARAGE_ENDPOINT?.trim();
  const region = process.env.GARAGE_REGION?.trim();
  const accessKeyId = process.env.GARAGE_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.GARAGE_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.GARAGE_BUCKET?.trim();

  if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
    bucket,
    uploadExpiresSeconds: parseExpiresSeconds(
      process.env.GARAGE_PRESIGN_UPLOAD_EXPIRES_SECONDS,
      DEFAULT_UPLOAD_EXPIRES_SECONDS,
    ),
    getExpiresSeconds: parseExpiresSeconds(
      process.env.GARAGE_PRESIGN_GET_EXPIRES_SECONDS,
      DEFAULT_GET_EXPIRES_SECONDS,
    ),
  };
}

export function getGarageClient(): S3Client | null {
  const config = getGarageConfig();
  if (!config) return null;

  // Include checksum mode in cache key so dev HMR does not reuse a pre-fix client.
  const configKey = `${config.endpoint}|${config.region}|${config.accessKeyId}|${config.bucket}|crc-when-required`;

  if (
    globalForGarage.garageClient &&
    globalForGarage.garageConfigKey === configKey
  ) {
    return globalForGarage.garageClient;
  }

  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
    // SDK 3.729+ adds CRC32 to presigned PUTs by default; browsers cannot
    // satisfy that without computing the checksum. Garage then returns 400.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  globalForGarage.garageConfigKey = configKey;
  globalForGarage.garageClient = client;
  return client;
}

export async function presignPutObject(
  objectKey: string,
  contentType: string,
): Promise<{ uploadUrl: string; expiresIn: number } | null> {
  const config = getGarageConfig();
  const client = getGarageClient();
  if (!config || !client) return null;

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: contentType,
  });

  const expiresIn = config.uploadExpiresSeconds;
  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  return { uploadUrl, expiresIn };
}

export async function presignGetObject(
  objectKey: string,
): Promise<{ playbackUrl: string; expiresIn: number } | null> {
  const config = getGarageConfig();
  const client = getGarageClient();
  if (!config || !client) return null;

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
  });

  const expiresIn = config.getExpiresSeconds;
  const playbackUrl = await getSignedUrl(client, command, { expiresIn });
  return { playbackUrl, expiresIn };
}
