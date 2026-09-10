import type { Env } from "./types/env.ts";

const response = { status: "ok", service: "qto-erp-chatbot" };

export default {
  async fetch(_request: Request, _env: Env): Promise<Response> {
    return Response.json(response);
  },
};
