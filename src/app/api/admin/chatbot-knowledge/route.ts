import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  createChatbotKnowledgeAdmin,
  listChatbotKnowledgeAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { createChatbotKnowledgeSchema } from "@/lib/validations/admin-chatbot-knowledge";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const items = await listChatbotKnowledgeAdmin();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/chatbot-knowledge GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function POST(request: Request) {
  const admin = await requireRole(request, "content:create");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createChatbotKnowledgeSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const item = await createChatbotKnowledgeAdmin(parsed.data);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/chatbot-knowledge POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
