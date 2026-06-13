// @opsboard/web — the wire contracts for the /research surface ⇄ its API routes.
// Web-specific (not a shared @opsboard/types domain shape): the parse-response
// and enqueue-request shapes the client and /api/research(/parse) agree on.

/** A target-task candidate the surface renders (ParsedIntentPanel / DisambiguationPicker). */
export interface ResearchTaskCandidate {
  taskId: string;
  name: string;
  /** Category slug (one of the five seeds) or "uncategorised". */
  category: string;
  /** Name-relevance display score, 0–100 (see research-match — NOT a semantic confidence). */
  matchPct: number;
}

/** The /api/research/parse success response — a parsed research request for review. */
export interface ResearchParseResult {
  /** The raw transcript Whisper produced. */
  transcript: string;
  /** The cleaned research question the agent will run. */
  query: string;
  /** The parse model's confidence in the query + target, 0–100. */
  confidence: number;
  /** Matching tasks, best first ([] when nothing in the mission matched). */
  candidates: ResearchTaskCandidate[];
}

/** The /api/research enqueue request — fired by CUE RESEARCH. */
export interface CueResearchRequest {
  missionId: string;
  taskId: string;
  query: string;
}

/** The /api/research enqueue response. */
export interface CueResearchResult {
  jobId: string;
}

/** A client-safe error envelope both routes may return (status carries the code). */
export interface ResearchErrorBody {
  error: string;
  /** `NO_AI_KEY` (402) drives the "add keys in Settings" prompt. */
  code?: string;
  provider?: string;
}
