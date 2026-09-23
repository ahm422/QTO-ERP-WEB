import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { chatSchema } from "@/lib/validations/chat";
import { callChatbot, mapWorkerResponse } from "@/lib/chat";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const result = await callChatbot(request, parsed.data.message);

  if (!result.ok) {
    if (result.reason === "no_transport") {
      console.error("[api/chat] No chatbot transport configured (CHATBOT binding or CHATBOT_URL)");
      return jsonError("Chat is temporarily unavailable.", 503);
    }
    if (result.reason === "timeout") {
      console.error("[api/chat] Chatbot Worker request timed out");
      return jsonError("The assistant is unavailable right now. Please try again.", 504);
    }
    console.error("[api/chat] Chatbot Worker request failed:", result.error);
    return jsonError("The assistant is unavailable right now. Please try again.", 502);
  }

  const mapped = mapWorkerResponse(result.status, result.body, result.retryAfter);
  return NextResponse.json(mapped.body, { status: mapped.status, headers: mapped.headers });
}
