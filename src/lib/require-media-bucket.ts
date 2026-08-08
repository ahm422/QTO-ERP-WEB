import { NextResponse } from "next/server";
import { getMediaBucket } from "@/lib/media";

type RequireMediaBucketSuccess = { bucket: R2Bucket };
type RequireMediaBucketFailure = { error: NextResponse };

export async function requireMediaBucket(): Promise<
  RequireMediaBucketSuccess | RequireMediaBucketFailure
> {
  try {
    const bucket = await getMediaBucket();
    if (!bucket) {
      throw new Error("MEDIA_BUCKET binding missing");
    }
    return { bucket };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Object storage not configured" },
        { status: 500 },
      ),
    };
  }
}
