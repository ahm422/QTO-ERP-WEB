import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: error.flatten().fieldErrors,
    },
    { status: 400 },
  );
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
