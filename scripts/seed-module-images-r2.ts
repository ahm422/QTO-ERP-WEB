/**
 * Upload seed module images to local or remote R2 via wrangler.
 * Safe to call from Node seed scripts (no Workers MEDIA_BUCKET binding).
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ASSETS: Array<{ localPath: string; objectKey: string; contentType: string }> = [
  {
    localPath: "public/assets/images/attendance.png",
    objectKey: "module-images/attendance.png",
    contentType: "image/png",
  },
  {
    localPath: "public/assets/images/salary.png",
    objectKey: "module-images/salary.png",
    contentType: "image/png",
  },
  {
    localPath: "public/assets/images/finance.png",
    objectKey: "module-images/finance.png",
    contentType: "image/png",
  },
];

export type SeedModuleImagesR2Options = {
  remote?: boolean;
  env?: "staging" | "production";
  bucketName?: string;
};

export function seedModuleImageObjectsToR2(
  options: SeedModuleImagesR2Options = {},
): void {
  const bucket =
    options.bucketName ??
    (options.env === "staging"
      ? "qto-erp-media-staging"
      : "qto-erp-media-production");

  for (const asset of ASSETS) {
    const abs = join(process.cwd(), asset.localPath);
    if (!existsSync(abs)) {
      console.warn(`Module image missing, skip R2 put: ${asset.localPath}`);
      continue;
    }

    const args = [
      "wrangler",
      "r2",
      "object",
      "put",
      `${bucket}/${asset.objectKey}`,
      "--file",
      abs,
      "--content-type",
      asset.contentType,
    ];

    if (options.remote) {
      args.push("--remote");
    } else {
      args.push("--local");
    }
    if (options.env === "staging") {
      args.push("--env", "staging");
    }

    try {
      execFileSync("npx", args, { stdio: "inherit", cwd: process.cwd() });
      console.log(`Uploaded ${asset.objectKey} → ${bucket}`);
    } catch (err) {
      console.warn(
        `Failed to upload ${asset.objectKey} (DB seed still has key; upload via admin if needed):`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}
