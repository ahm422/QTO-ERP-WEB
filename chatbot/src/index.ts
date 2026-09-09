export interface Env {}

const response = { status: "ok", service: "qto-erp-chatbot" };

export default {
  async fetch(): Promise<Response> {
    return Response.json(response);
  },
};
