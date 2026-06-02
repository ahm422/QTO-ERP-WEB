import { NextResponse } from "next/server";
import type { S3Client } from "@aws-sdk/client-s3";
import type { GarageConfig } from "@/lib/garage";
import { getGarageClient, getGarageConfig } from "@/lib/garage";

type RequireGarageSuccess = { client: S3Client; config: GarageConfig };
type RequireGarageFailure = { error: NextResponse };

export function requireGarage(): RequireGarageSuccess | RequireGarageFailure {
  const config = getGarageConfig();
  const client = getGarageClient();

  if (!config || !client) {
    return {
      error: NextResponse.json(
        { error: "Object storage not configured" },
        { status: 500 },
      ),
    };
  }

  return { client, config };
}
