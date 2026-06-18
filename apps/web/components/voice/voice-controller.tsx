"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CircleSlash, GitBranch, Info } from "lucide-react";

import { VoiceFAB } from "@opsboard/ui/components/voice-fab";
import { RecordingPanel } from "@opsboard/ui/components/recording-panel";
import { Toaster, toast, type ToastPick } from "@opsboard/ui/components/toast";
import type { VoiceIntent } from "@opsboard/types";

import { useVoiceRecorder } from "@/components/voice/use-voice-recorder";
import { Waveform } from "@/components/voice/waveform";

// VoiceController — the single client island that wires the voice command flow
// into the read-only board. It is the WIRE layer between three already-shipped
// pieces:
//   • use-voice-recorder  → the MediaRecorder state machine (idle/requesting/
//     recording/processing/error) + the live analyser for the waveform,
//   • @opsboard/ui VoiceFAB + RecordingPanel  → the presentational capture UI,
//   • @opsboard/ui Toast/Toaster  → the result/confirm/disambiguation/query/error
//     feedback surfaces.
//
// On a captured clip it POSTs multipart { audio, tz } to /api/voice/command and
// folds the CommandResponse into a toast (or re-issues an intent as JSON for the
// confirm / disambiguation paths). After any successful MUTATION it calls
// router.refresh() so the board reflects the change. It NEVER appends text and
// NEVER mutates the board directly — the board mutates only via the command
// route (this stage) or a StatusCycleButton tap (S4). Per
// docs/tech-spec/03-surfaces/voice-toasts.md.

// --- The /api/voice/command response contract (mirrored for the client) -----
// The server's ExecuteResult / QueryAnswer / DisambiguationOption types live in
// the server-only @/lib/voice-execute module; we re-declare the wire shapes here
// so this client component never imports that "server-only" file.

type ExecuteResult =
  | { kind: "mission_created"; missionId: string; name: string }
  | { kind: "task_created"; taskId: string; name: string; mission: string }
  | { kind: "category_created"; name: string; slug: string }
  | {
      kind: "task_status_updated";
      taskId: string;
      name: string;
      status: "not-started" | "in-progress" | "done";
    }
  | { kind: "task_updated"; taskId: string; name: string; field: string }
  | { kind: "dependency_added"; taskName: string; dependsOnName: string }
  | { kind: "dependency_removed"; taskName: string; dependsOnName: string }
  | { kind: "task_deleted"; name: string }
  | { kind: "mission_deleted"; name: string }
  | { kind: "query_answer"; answer: QueryAnswer };

interface QueryAnswer {
  topic: "blocked" | "closing" | "critical_path" | "general";
  header: string;
  answer: string;
  rows: Array<{ taskId: string; name: string; window: string }>;
}

interface DisambiguationOption {
  id: string;
  name: string;
  code: string;
}

interface CommandResponse {
  transcript: string;
  intent: VoiceIntent | null;
  result?: ExecuteResult;
  needsConfirmation?: true;
  clarify?: string;
  needsDisambiguation?: true;
  options?: DisambiguationOption[];
  prompt?: string;
  error?: string;
}

const COMMAND_ENDPOINT = "/api/voice/command";

/** Whether a result is a board MUTATION (→ refresh) vs a read-only query answer. */
function isMutationResult(result: ExecuteResult): boolean {
  return result.kind !== "query_answer";
}

/** mm:ss from elapsed whole seconds (mirrors the RecordingPanel timer idiom). */
function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * The resolving *Hint field for each intent, used to re-bind a disambiguation
 * pick. Setting it to the picked option's exact `name` makes the server-side
 * resolveHint land a single ("one") match on re-issue, so the JSON re-issue
 * executes directly. Some intents carry two resolving hints (dependency edits);
 * the disambiguation prompt only ever asks about one at a time, so we rewrite
 * whichever hint the route was resolving — the route re-runs resolution and, if
 * the OTHER hint is still ambiguous, returns a fresh disambiguation toast.
 */
function rebindIntentHint(
  intent: VoiceIntent,
  pickedName: string,
): VoiceIntent {
  switch (intent.intent) {
    case "create_task":
      // A new task disambiguates on the owning mission.
      return { ...intent, missionHint: pickedName };
    case "update_task_status":
    case "update_task":
    case "delete_task":
      return { ...intent, taskHint: pickedName };
    case "delete_mission":
      return { ...intent, missionHint: pickedName };
    case "add_dependency":
    case "remove_dependency":
      // Two resolving hints (taskHint + dependsOnHint). The route resolves
      // taskHint first; once that's pinned it surfaces the dependsOnHint pick.
      // Rewrite taskHint when it's still ambiguous, otherwise the dependsOn.
      // We can't see which from here, so re-bind both candidates: pin taskHint
      // if it isn't an exact match yet, else dependsOnHint. The server's idempotent
      // re-resolution tolerates an already-exact hint, so pinning taskHint is safe
      // and the follow-up disambiguation (if any) carries the next pick.
      return { ...intent, taskHint: pickedName };
    default:
      // create_mission / query / unknown never disambiguate; nothing to rebind.
      return intent;
  }
}

/** Per-topic icon + tone for the read-only voice-query result panel. */
function queryToastBody(answer: QueryAnswer): React.ReactNode {
  const Icon =
    answer.topic === "closing"
      ? CalendarClock
      : answer.topic === "critical_path"
        ? GitBranch
        : answer.topic === "blocked"
          ? CircleSlash
          : Info;

  return (
    <span className="flex flex-col gap-2.5">
      <span className="flex items-start gap-2">
        <Icon
          aria-hidden="true"
          className="mt-0.5 size-3.5 shrink-0 text-primary"
        />
        <span className="text-body leading-snug text-foreground">
          {answer.answer}
        </span>
      </span>
      {answer.rows.length > 0 ? (
        <ul className="flex flex-col">
          {answer.rows.map((row, i) => (
            <li
              key={row.taskId}
              className={`flex items-center justify-between gap-3 py-2 ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <span className="min-w-0 truncate font-mono text-mono-caption text-foreground">
                {row.name}
              </span>
              <span className="shrink-0 font-mono text-micro-xs uppercase tracking-[1px] text-muted-foreground">
                {row.window}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  );
}

export function VoiceController() {
  const router = useRouter();

  // Elapsed-seconds timer for the RecordingPanel mm:ss readout, started when the
  // recorder enters `recording` and reset on each capture.
  const [elapsed, setElapsed] = React.useState(0);

  // Browser IANA timezone — sent with each clip so the classifier resolves
  // relative dates against the operator's local calendar. Resolved once.
  const tz = React.useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  // POST the JSON confirm / disambiguation re-issue (shape B). This is the ONLY
  // path that runs a destructive delete. On success → success/query toast; on
  // failure → error toast. Mutations refresh the board. It re-enters the same
  // response handler; the handler↔reissue cycle is broken via a ref so neither
  // callback has to depend on the other.
  const handleResponseRef = React.useRef<(data: CommandResponse) => void>(
    () => {},
  );

  const reissue = React.useCallback(async (intent: VoiceIntent) => {
    try {
      const res = await fetch(COMMAND_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intent, confirmed: true }),
      });
      const data = (await res.json().catch(() => null)) as
        | CommandResponse
        | { error?: string }
        | null;
      if (!res.ok || !data) {
        toast.error("COMMAND FAILED", {
          body:
            (data as { error?: string } | null)?.error ??
            "That command couldn't be completed.",
          meta: "TAP TO DISMISS",
        });
        return;
      }
      handleResponseRef.current(data as CommandResponse);
    } catch {
      toast.error("COMMAND FAILED", {
        body: "Network error — please try again.",
        meta: "TAP TO DISMISS",
      });
    }
  }, []);

  // Fold a CommandResponse into the right feedback surface.
  const handleResponse = React.useCallback(
    (data: CommandResponse) => {
      // 1. A mutation ran or a query answered.
      if (data.result) {
        const result = data.result;
        if (result.kind === "query_answer") {
          // Read-only info panel — distinct $primary/info tone, longer dwell.
          toast.info(result.answer.header, {
            body: queryToastBody(result.answer),
            durationMs: 8000,
          });
          return;
        }
        // A board mutation succeeded → success toast + refresh.
        toast.success(successHeader(result), {
          body: successBody(result),
          meta: "AUTO-DISMISS · 5S",
        });
        if (isMutationResult(result)) router.refresh();
        return;
      }

      // 2. Destructive / low-confidence gate → persistent confirm toast. The
      // confirm re-issues the SAME intent as JSON (confirmed:true).
      if (data.needsConfirmation && data.intent) {
        const intent = data.intent;
        toast.needsConfirmation(confirmHeader(intent), {
          body: data.clarify ?? confirmBody(intent),
          actions: [
            { label: confirmLabel(intent), intent: "confirm" },
            { label: "CANCEL", intent: "cancel" },
          ],
          onConfirm: () => void reissue(intent),
          // Cancel is a no-op (the toast just dismisses).
        });
        return;
      }

      // 3. Several entities matched → tap-to-pick disambiguation. Re-bind the
      // resolving hint to the picked name and re-issue (confirmed).
      if (data.needsDisambiguation && data.options && data.intent) {
        const intent = data.intent;
        const options = data.options;
        const picks: ToastPick[] = options.map((o) => ({
          name: o.name,
          code: o.code,
        }));
        toast.disambiguation(headerFromPrompt(data.prompt) ?? "WHICH ONE?", {
          body: data.prompt ?? "Multiple matches — which one?",
          picks,
          onPick: (_pick, index) => {
            const chosen = options[index];
            if (!chosen) return;
            void reissue(rebindIntentHint(intent, chosen.name));
          },
        });
        return;
      }

      // 4. Explicit error → destructive toast (role=alert via the variant).
      if (data.error) {
        toast.error("COMMAND FAILED", {
          body: data.transcript
            ? `${data.error} (heard: "${data.transcript}")`
            : data.error,
          meta: "TAP TO DISMISS",
        });
        return;
      }

      // 5. A bare clarify with no gate flag (defensive) → soft info toast.
      if (data.clarify) {
        toast.info("NEEDS CLARIFICATION", { body: data.clarify });
        return;
      }

      // 6. Nothing actionable came back.
      toast.error("COMMAND FAILED", {
        body: "No response from the command pipeline.",
        meta: "TAP TO DISMISS",
      });
    },
    [router, reissue],
  );

  // Keep the ref pointing at the latest handler so `reissue` (which has an empty
  // dep list) always folds the re-issued response through the current closure.
  handleResponseRef.current = handleResponse;

  // The captured-clip handler (shape A). The recorder hands us the blob; we own
  // the multipart POST and the structured-response handling. Throwing here makes
  // the recorder transition the FAB to `error` (TAP TO RETRY); resolving returns
  // it to `idle`.
  const onBlob = React.useCallback(
    async (blob: Blob, mimeType: string) => {
      const form = new FormData();
      const ext = mimeType.includes("mp4") ? "m4a" : "webm";
      form.append("audio", new File([blob], `command.${ext}`, { type: mimeType }));
      form.append("tz", tz);

      const res = await fetch(COMMAND_ENDPOINT, { method: "POST", body: form });

      // Guard failures (401/413/415/429/400) are non-200 and carry no transcript
      // body — surface them as an error toast WITHOUT throwing, so the FAB lands
      // back on idle rather than the retry state for, e.g., a rate-limit.
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        const retryAfter = res.headers.get("Retry-After");
        toast.error("COMMAND FAILED", {
          body:
            res.status === 429
              ? `Too many commands — try again${
                  retryAfter ? ` in ${retryAfter}s` : " shortly"
                }.`
              : (data?.error ?? `Command failed (${res.status}).`),
          meta: "TAP TO DISMISS",
        });
        return;
      }

      const data = (await res.json()) as CommandResponse;
      handleResponse(data);
    },
    [tz, handleResponse],
  );

  const recorder = useVoiceRecorder({ onBlob });
  const { state, analyser, start, stop, reset } = recorder;

  // Drive the elapsed timer off the recorder state: tick while recording, reset
  // when a fresh capture begins.
  const isRecording = state === "recording";
  React.useEffect(() => {
    if (!isRecording) return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // Tap-to-toggle: idle → record, recording → stop, error → retry (reset+record).
  const onPress = React.useCallback(() => {
    if (state === "recording") {
      stop();
    } else if (state === "error") {
      reset();
      void start();
    } else if (state === "idle") {
      void start();
    }
    // requesting/processing are transient and not user-actionable.
  }, [state, start, stop, reset]);

  // Push-to-talk: hold to record, release (or slide off / cancel) to stop.
  const onPointerDown = React.useCallback(() => {
    if (state === "idle") void start();
    else if (state === "error") {
      reset();
      void start();
    }
  }, [state, start, reset]);
  const onPointerStop = React.useCallback(() => {
    if (state === "recording") stop();
  }, [state, stop]);

  return (
    <>
      {/* The active capture surface — only while recording/processing. The FAB
          itself carries the compact inline waveform; this panel gives the larger
          REC dot + label + mm:ss timer + the full canvas waveform + the
          PARSING INTENT… cue once the clip is being transcribed/parsed. Anchored
          just above the FAB, bottom-right, clear of the toast region. */}
      {state === "recording" || state === "processing" ? (
        <div className="fixed bottom-24 right-4 z-[150] w-[min(360px,calc(100vw-2rem))] pb-[env(safe-area-inset-bottom)]">
          <RecordingPanel
            state={state === "processing" ? "parsing" : "recording"}
            elapsedLabel={formatElapsed(elapsed)}
          >
            <Waveform analyser={analyser} active={isRecording} />
          </RecordingPanel>
        </div>
      ) : null}

      {/* The single fixed mic FAB — bottom-right, above the Toaster, safe-area
          inset on mobile. Renders one lifecycle state; the hint is suppressed in
          fixed product placement (the RecordingPanel carries the status copy). */}
      <VoiceFAB
        state={state}
        hint={null}
        onPress={onPress}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerStop}
        onPointerLeave={onPointerStop}
        onPointerCancel={onPointerStop}
        className="fixed bottom-0 right-0 z-[150] m-4 pb-[env(safe-area-inset-bottom)]"
      />

      {/* The feedback surface for every command response. Sits above the FAB. */}
      <Toaster className="z-[160]" />
    </>
  );
}

// --- Success-toast copy (board-authoritative header words) ------------------

function successHeader(result: ExecuteResult): string {
  switch (result.kind) {
    case "mission_created":
      return "✓ MISSION CREATED";
    case "task_created":
      return "✓ TASK ADDED";
    case "category_created":
      return "✓ CATEGORY CREATED";
    case "task_status_updated":
      return result.status === "done"
        ? "✓ MARKED DONE"
        : result.status === "in-progress"
          ? "✓ IN PROGRESS"
          : "✓ STATUS UPDATED";
    case "task_updated":
      return "✓ TASK UPDATED";
    case "dependency_added":
      return "✓ DEPENDENCY ADDED";
    case "dependency_removed":
      return "✓ DEPENDENCY REMOVED";
    case "task_deleted":
      return "✓ TASK DELETED";
    case "mission_deleted":
      return "✓ MISSION DELETED";
    case "query_answer":
      return result.answer.header;
  }
}

function successBody(result: ExecuteResult): string {
  switch (result.kind) {
    case "mission_created":
      return result.name;
    case "task_created":
      return `${result.name} — ${result.mission}`;
    case "category_created":
      return result.name;
    case "task_status_updated":
      return result.name;
    case "task_updated":
      return `${result.name} — ${result.field} updated`;
    case "dependency_added":
      return `${result.taskName} now depends on ${result.dependsOnName}`;
    case "dependency_removed":
      return `${result.taskName} no longer depends on ${result.dependsOnName}`;
    case "task_deleted":
    case "mission_deleted":
      return result.name;
    case "query_answer":
      return result.answer.answer;
  }
}

// --- Confirm-toast copy (the gated verb drives the label/header) ------------

function confirmHeader(intent: VoiceIntent): string {
  if (intent.intent === "delete_task" || intent.intent === "delete_mission") {
    return "CONFIRM DELETE";
  }
  if (intent.intent === "unknown") return "DIDN'T CATCH THAT";
  return "PLEASE CONFIRM";
}

function confirmBody(intent: VoiceIntent): string {
  switch (intent.intent) {
    case "delete_task":
      return `Delete task "${intent.taskHint}"?`;
    case "delete_mission":
      return `Delete mission "${intent.missionHint}" and all its tasks?`;
    case "unknown":
      return "I couldn't tell what you meant. Try rephrasing the command.";
    default:
      return "Confirm this command?";
  }
}

function confirmLabel(intent: VoiceIntent): string {
  if (intent.intent === "delete_task" || intent.intent === "delete_mission") {
    return "DELETE";
  }
  return "CONFIRM";
}

// --- Disambiguation header from the server's prompt -------------------------

/** Map the route's prompt phrasing to a mono caps header word. */
function headerFromPrompt(prompt: string | undefined): string | null {
  if (!prompt) return null;
  const p = prompt.toLowerCase();
  if (p.includes("mission")) return "WHICH MISSION?";
  if (p.includes("task")) return "WHICH TASK?";
  return "WHICH ONE?";
}
