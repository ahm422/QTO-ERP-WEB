import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteChatbotKnowledgeAdmin,
  getChatbotKnowledgeByIdAdmin,
  updateChatbotKnowledgeAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { updateChatbotKnowledgeSchema } from "@/lib/validations/admin-chatbot-knowledge";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateChatbotKnowledgeSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const existing = await getChatbotKnowledgeByIdAdmin(id);
    if (!existing) return jsonError("Knowledge article not found", 404);

    const item = await updateChatbotKnowledgeAdmin(id, parsed.data);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[api/admin/chatbot-knowledge/[id] PATCH] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:delete");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const deleted = await deleteChatbotKnowledgeAdmin(id);
    if (!deleted) return jsonError("Knowledge article not found", 404);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/chatbot-knowledge/[id] DELETE] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
