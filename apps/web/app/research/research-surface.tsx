"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleAlert, Mic, MicOff, SearchX } from "lucide-react";
import { z } from "zod";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { ScopeChip } from "@opsboard/ui/components/scope-chip";
import { ParsedIntentPanel } from "@opsboard/ui/components/parsed-intent-panel";
import { DisambiguationPicker } from "@opsboard/ui/components/disambiguation-picker";
import { ConfirmBar } from "@opsboard/ui/components/confirm-bar";
import { ErrorStateCard } from "@opsboard/ui/components/error-state-card";
import { VoiceFAB } from "@opsboard/ui/components/voice-fab";
import { RecordingPanel } from "@opsboard/ui/components/recording-panel";
import { type Category, CATEGORIES } from "@opsboard/ui/lib/categories";

import { Waveform } from "@/components/voice/waveform";
import { useVoiceRecorder } from "@/components/voice/use-voice-recorder";
import type { ResearchParseResult } from "@/lib/research-types";

// The API can return either a typed payload OR `{ error }`; validate the success
// shape at the client boundary (don't `as`-assert an untrusted response).
const ParseResultSchema = z.object({
  transcript: z.string(),
  query: z.string(),
  confidence: z.number(),
  candidates: z.array(
    z.object({
      taskId: z.string(),
      name: z.string(),
      category: z.string(),
      matchPct: z.number(),
    }),
  ),
});
const CueResultSchema = z.object({ jobId: z.string() });

// /research Capture & Parse surface (client). Records a spoken research request,
// parses it (POST /api/research/parse) into a query + ranked target-task
// candidates, lets the user review/disambiguate, and on CUE RESEARCH enqueues
// the job (POST /api/research). The board pipeline is untouched — this is its
// own mission-scoped capture flow. On CUE RESEARCH it enqueues the job and
// navigates to /research/[jobId] — the live Running surface that polls the
// Inngest-advanced job row.

/** Coerce a research-result category slug to the UI Category union. Anything
 *  outside the seeded tones (a user-created slug, or `general` itself) falls back
 *  to the NEUTRAL `general` tone — NOT bureaucratic, which used to paint every
 *  general/unknown task with the blue bureaucratic hue. */
function asCategory(slug: string): Category {
  return (CATEGORIES as readonly string[]).includes(slug)
    ? (slug as Category)
    : "general";
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export interface ResearchSurfaceProps {
  missionId: string;
  missionName: string;
}

export function ResearchSurface({
  missionId,
  missionName,
}: ResearchSurfaceProps) {
  const router = useRouter();
  const [parse, setParse] = React.useState<ResearchParseResult | null>(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [cueState, setCueState] = React.useState<"idle" | "cueing">("idle");
  const [elapsedMs, setElapsedMs] = React.useState(0);

  const tz = React.useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  // The recorder owns delivery: on stop it hands us the blob; we POST it to the
  // parse endpoint and fold the response into the review state.
  const onBlob = React.useCallback(
    async (blob: Blob, mimeType: string) => {
      setError(null);
      const form = new FormData();
      form.append(
        "audio",
        new File([blob], `clip.${mimeType.includes("mp4") ? "m4a" : "webm"}`, {
          type: mimeType,
        }),
      );
      form.append("tz", tz);
      form.append("missionId", missionId);

      let data: unknown;
      let ok: boolean;
      try {
        const res = await fetch("/api/research/parse", {
          method: "POST",
          body: form,
        });
        ok = res.ok;
        data = await res.json().catch(() => ({}));
      } catch {
        setError("Network error — check your connection and try again.");
        return;
      }

      const parsed = ParseResultSchema.safeParse(data);
      if (!ok || !parsed.success) {
        const errMsg =
          data && typeof data === "object" && "error" in data
            ? String((data as { error?: unknown }).error ?? "")
            : "";
        setError(errMsg || "Couldn't parse that — try again.");
        return;
      }

      const result: ResearchParseResult = parsed.data;
      setParse(result);
      // Auto-pick ONLY when exactly one task matches. When several match, leave
      // the selection empty so the user must explicitly disambiguate before
      // CUE RESEARCH — never assume an ambiguous target.
      setSelectedTaskId(
        result.candidates.length === 1 ? result.candidates[0]!.taskId : null,
      );
      setCueState("idle");
    },
    [tz, missionId],
  );

  const {
    state,
    error: recError,
    start,
    stop,
    reset,
    analyser,
  } = useVoiceRecorder({ onBlob });

  const isRecording = state === "recording";

  // Elapsed timer for the RecordingPanel while capturing.
  const startedAtRef = React.useRef(0);
  React.useEffect(() => {
    if (state !== "recording") return;
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    const id = setInterval(
      () => setElapsedMs(Date.now() - startedAtRef.current),
      250,
    );
    return () => clearInterval(id);
  }, [state]);

  const onPress = React.useCallback(() => {
    if (state === "idle") void start();
    else if (state === "recording") stop();
    else if (state === "error") {
      reset();
      void start();
    }
  }, [state, start, stop, reset]);
  const onPointerDown = React.useCallback(() => {
    if (state === "idle") void start();
  }, [state, start]);
  const onPointerStop = React.useCallback(() => {
    if (state === "recording") stop();
  }, [state, stop]);

  const reRecord = React.useCallback(() => {
    setParse(null);
    setSelectedTaskId(null);
    setError(null);
    setCueState("idle");
    if (state === "error") reset();
  }, [state, reset]);

  // The chosen target — ONLY the explicitly-selected candidate (no silent
  // fallback to the top match). Ambiguous parses stay unselected until the user
  // picks, which gates CUE RESEARCH below.
  const selected =
    parse?.candidates.find((c) => c.taskId === selectedTaskId) ?? null;

  const cueResearch = React.useCallback(async () => {
    if (!parse || !selected || cueState === "cueing") return;
    setCueState("cueing");
    setError(null);
    let data: unknown;
    let ok: boolean;
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          missionId,
          taskId: selected.taskId,
          query: parse.query,
        }),
      });
      ok = res.ok;
      data = await res.json().catch(() => ({}));
    } catch {
      setError("Network error — check your connection and try again.");
      setCueState("idle");
      return;
    }
    const cue = CueResultSchema.safeParse(data);
    if (!ok || !cue.success) {
      const errMsg =
        data && typeof data === "object" && "error" in data
          ? String((data as { error?: unknown }).error ?? "")
          : "";
      setError(errMsg || "Couldn't start research — try again.");
      setCueState("idle");
      return;
    }
    // Job enqueued — hand off to the live Running surface (keep `cueing` so the
    // button stays disabled until the route transition unmounts this surface).
    router.push(`/research/${cue.data.jobId}`);
  }, [parse, selected, cueState, missionId, router]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        right={
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft aria-hidden="true" /> Board
            </Link>
          </Button>
        }
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 p-6">
        <header className="flex flex-col gap-2">
          <Eyebrow as="h1" tone="foreground" weight={700} tracking={2}>
            Task Agent
          </Eyebrow>
          <p className="text-label text-muted-foreground">
            Voice-cue a research job, scoped to one mission. Findings are
            proposed as notes on a task — nothing is saved until you confirm.
          </p>
        </header>

        <ScopeChip variant="locked" mission={missionName} />

        {!parse ? (
          // --- Capture --------------------------------------------------
          <div className="flex flex-col items-center gap-5 border border-border bg-card p-6">
            {isRecording || state === "processing" ? (
              <RecordingPanel
                withAccent
                state={state === "processing" ? "parsing" : "recording"}
                elapsedLabel={formatElapsed(elapsedMs)}
              >
                <Waveform analyser={analyser} active={isRecording} />
              </RecordingPanel>
            ) : (
              <p className="max-w-md text-center text-[14px] leading-relaxed text-muted-foreground">
                Hold the mic and describe what to research — name the task it
                belongs to (e.g. “how to submit the land-use permit, for my
                permit task”).
              </p>
            )}
            <VoiceFAB
              state={state}
              onPress={onPress}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerStop}
              onPointerLeave={onPointerStop}
              onPointerCancel={onPointerStop}
            />
            {recError ? (
              <ErrorStateCard
                className="w-full"
                tone="destructive"
                icon={MicOff}
                // Only a permission denial is truly "blocked"; "no microphone" /
                // "recording failed" get the device-agnostic header.
                header={
                  /permission/i.test(recError)
                    ? "MICROPHONE BLOCKED"
                    : "VOICE CAPTURE FAILED"
                }
                body={recError}
                actions={[
                  {
                    label: "Try again",
                    variant: "primary",
                    icon: Mic,
                    onClick: onPress,
                  },
                ]}
              />
            ) : error ? (
              // A transcribe/parse failure (network, vendor key, rate-limit) —
              // previously this was set but never shown in the capture stage.
              <ErrorStateCard
                className="w-full"
                tone="destructive"
                icon={CircleAlert}
                header="COULDN’T PARSE THAT"
                body={error}
                actions={[
                  {
                    label: "Try again",
                    variant: "primary",
                    icon: Mic,
                    onClick: () => {
                      setError(null);
                      onPress();
                    },
                  },
                ]}
              />
            ) : null}
          </div>
        ) : (
          // --- Review ---------------------------------------------------
          <>
            <div className="flex flex-col gap-2 border-l-[3px] border-primary bg-card p-4">
              <span className="font-mono text-micro uppercase leading-none tracking-[1.5px] text-muted-foreground-subtle">
                Transcript
              </span>
              <p className="font-mono text-[15px] leading-relaxed text-foreground">
                {parse.transcript}
              </p>
              <button
                type="button"
                onClick={reRecord}
                className="self-start font-mono text-[11px] uppercase tracking-[1px] text-primary outline-none hover:underline focus-visible:underline"
              >
                Re-record
              </button>
            </div>

            {selected ? (
              <ParsedIntentPanel
                intentLabel="RESEARCH"
                query={parse.query}
                target={{
                  name: selected.name,
                  category: asCategory(selected.category),
                  caption: `${selected.category.toUpperCase()} · MATCHED IN MISSION`,
                  confidence: selected.matchPct,
                }}
                action="Append research notes to this task"
              />
            ) : parse.candidates.length === 0 ? (
              <ErrorStateCard
                icon={SearchX}
                header="NO RESULTS FOUND"
                body={`No task in “${missionName}” matched that. Try naming the task more directly, then re-record.`}
                actions={[
                  {
                    label: "Re-record",
                    variant: "primary",
                    icon: Mic,
                    onClick: reRecord,
                  },
                ]}
              />
            ) : (
              // Ambiguous: several tasks matched — show the query, and require an
              // explicit pick from the DisambiguationPicker below before cueing.
              <div className="flex flex-col gap-2 border border-border bg-card p-4">
                <span className="font-mono text-micro uppercase leading-none tracking-[1.5px] text-muted-foreground-subtle">
                  Query
                </span>
                <p className="font-mono text-[14px] leading-relaxed text-foreground">
                  {`“${parse.query}”`}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  Several tasks match — pick the one these notes belong to
                  below.
                </p>
              </div>
            )}

            {parse.candidates.length > 1 ? (
              <DisambiguationPicker
                variant="panel"
                prompt={`${parse.candidates.length} tasks match — pick one`}
                candidates={parse.candidates.map((c) => ({
                  id: c.taskId,
                  name: c.name,
                  category: asCategory(c.category),
                  caption: c.category.toUpperCase(),
                  confidence: c.matchPct,
                  selected: c.taskId === selectedTaskId,
                }))}
                onPick={(id) => setSelectedTaskId(id)}
              />
            ) : null}

            {error ? (
              <ErrorStateCard
                tone="destructive"
                icon={CircleAlert}
                header="COULDN’T START RESEARCH"
                body={error}
                actions={[
                  {
                    label: "Dismiss",
                    variant: "outline",
                    onClick: () => setError(null),
                  },
                ]}
              />
            ) : null}

            {selected ? (
              <ConfirmBar
                variant="bar"
                hint="Phrasing can be terse — the mission scope plus the agent resolve the rest."
                confirmLabel={
                  cueState === "cueing" ? "STARTING…" : "CUE RESEARCH"
                }
                onConfirm={cueResearch}
                onCancel={reRecord}
              />
            ) : parse.candidates.length > 0 ? (
              // Candidates exist but none picked — CUE RESEARCH stays gated.
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-muted-foreground">
                  Pick a task above to continue.
                </span>
                <Button variant="outline" size="sm" onClick={reRecord}>
                  Re-record
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={reRecord}>
                  Re-record
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
