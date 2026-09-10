import type { Env } from "./types/env.ts";

const response = { status: "ok", service: "qto-erp-chatbot" };

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return Response.json(response);
    }

    return new Response("Not Found", { status: 404 });
  },
};
