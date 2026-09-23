/**
 * Safe, opt-in retrieval diagnostics.
 *
 * Threaded (optionally) through retrieval -> resolution -> rerank -> generation
 * so operators can tell WHY no answer was produced, without logging prompts,
 * retrieved text, secrets, or credentials.
 *
 * Enabled only when `CHATBOT_DEBUG_RETRIEVAL` is truthy. When disabled, callers
 * pass `undefined` and this module is never touched.
 */

export type RetrievalOutcome =
  | "no_vectorize_matches"
  | "all_below_vector_threshold"
  | "resolution_empty"
  | "rerank_empty"
  | "answered"
  | "unanswered";

/** One candidate that reached the generator context. */
export interface SelectedSourceDiagnostic {
  sourceTable: string;
  sourceId: string;
  chunkId: string;
  vectorId: string;
  vectorScore: number;
  rerankScore: number;
}

export interface RetrievalDiagnostics {
  vectorizeMatches: number;
  vectorizeDropped: number;
  vectorizeBelowThreshold: number;
  retrievalCandidates: number;

  resolutionMissing: number;
  resolutionUsable: number;

  rerankScored: number;
  rerankAboveFloor: number;
  rerankDroppedByTopN: number;
  rerankFallbackUsed: boolean;
  protectedVectorIds: string[];

  selected: SelectedSourceDiagnostic[];
  generatorAnswered: boolean;
  outcome: RetrievalOutcome;
}

export function createRetrievalDiagnostics(): RetrievalDiagnostics {
  return {
    vectorizeMatches: 0,
    vectorizeDropped: 0,
    vectorizeBelowThreshold: 0,
    retrievalCandidates: 0,
    resolutionMissing: 0,
    resolutionUsable: 0,
    rerankScored: 0,
    rerankAboveFloor: 0,
    rerankDroppedByTopN: 0,
    rerankFallbackUsed: false,
    protectedVectorIds: [],
    selected: [],
    generatorAnswered: false,
    outcome: "unanswered",
  };
}

/**
 * Compact, safe summary for logs. Contains only counts, table/source/vector
 * identifiers, and numeric scores — never message text.
 */
export function summarizeDiagnostics(diagnostics: RetrievalDiagnostics): Record<string, unknown> {
  return {
    outcome: diagnostics.outcome,
    vectorize: {
      matches: diagnostics.vectorizeMatches,
      dropped: diagnostics.vectorizeDropped,
      belowThreshold: diagnostics.vectorizeBelowThreshold,
      candidates: diagnostics.retrievalCandidates,
    },
    resolution: {
      missing: diagnostics.resolutionMissing,
      usable: diagnostics.resolutionUsable,
    },
    rerank: {
      scored: diagnostics.rerankScored,
      aboveFloor: diagnostics.rerankAboveFloor,
      droppedByTopN: diagnostics.rerankDroppedByTopN,
      fallbackUsed: diagnostics.rerankFallbackUsed,
      protected: diagnostics.protectedVectorIds,
    },
    selected: diagnostics.selected.map((entry) => ({
      source_table: entry.sourceTable,
      source_id: entry.sourceId,
      chunk_id: entry.chunkId,
      vector_id: entry.vectorId,
      vector_score: Number(entry.vectorScore.toFixed(4)),
      rerank_score: Number(entry.rerankScore.toFixed(4)),
    })),
    generatorAnswered: diagnostics.generatorAnswered,
  };
}
