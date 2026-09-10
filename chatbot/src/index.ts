import { handleChat } from "./chat/handler.ts";
import type { Env } from "./types/env.ts";

const response = { status: "ok", service: "qto-erp-chatbot" };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return Response.json(response);
    }

    if (url.pathname === "/chat") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleChat(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};
