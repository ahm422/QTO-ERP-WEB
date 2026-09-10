import { buildVectorId } from "./types/core.ts";
import { phaseOneIndexSummary } from "./rag/indexer.ts";
import type { Env } from "./types/env.ts";

const response = { status: "ok", service: "qto-erp-chatbot" };

const PHASE1_VERIFY_TABLE = "faqs" as const;
const PHASE1_VERIFY_SOURCE_ID = "albjgn6vyxfczeonp5orv7ay";

async function handlePhaseOneTest(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const result = await phaseOneIndexSummary(env, {
      tables: ["faqs"],
      maxRecordsPerTable: 1,
      batchSize: 4,
      dryRun: false,
      skipUnchanged: true,
    });

    return Response.json({
      rowsProcessed: result.rowsProcessed,
      chunksCreated: result.chunksCreated,
      embeddingsGenerated: result.embeddingsGenerated,
      vectorsUpserted: result.vectorsUpserted,
      skipped: result.rowsSkipped,
      failures: result.failures,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      {
        rowsProcessed: 0,
        chunksCreated: 0,
        embeddingsGenerated: 0,
        vectorsUpserted: 0,
        skipped: 0,
        failures: [message],
      },
      { status: 500 },
    );
  }
}

async function handlePhaseOneVerify(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const vectorId = buildVectorId(PHASE1_VERIFY_TABLE, PHASE1_VERIFY_SOURCE_ID, 0);
  const vectorize = env.VECTORIZE ?? env.vectorize;

  if (!vectorize || typeof vectorize.getByIds !== "function") {
    return Response.json(
      {
        sourceId: PHASE1_VERIFY_SOURCE_ID,
        vectorId,
        found: false,
        count: 0,
        diagnostic: "Vectorize binding missing or getByIds unavailable.",
      },
      { status: 500 },
    );
  }

  try {
    const matches = await vectorize.getByIds([vectorId]);
    const count = Array.isArray(matches) ? matches.length : 0;

    return Response.json({
      sourceId: PHASE1_VERIFY_SOURCE_ID,
      vectorId,
      found: count > 0,
      count,
      diagnostic: {
        binding: "VECTORIZE",
        method: "getByIds",
        index: "qto-erp-chatbot-vectors",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      {
        sourceId: PHASE1_VERIFY_SOURCE_ID,
        vectorId,
        found: false,
        count: 0,
        diagnostic: {
          binding: "VECTORIZE",
          method: "getByIds",
          error: message,
        },
      },
      { status: 500 },
    );
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/__dev/phase1-test") {
      return handlePhaseOneTest(request, env);
    }

    if (url.pathname === "/__dev/phase1-verify") {
      return handlePhaseOneVerify(request, env);
    }

    return Response.json(response);
  },
};
