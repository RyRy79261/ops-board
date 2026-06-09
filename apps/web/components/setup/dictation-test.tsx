"use client";

import * as React from "react";
import { Mic, Square } from "lucide-react";

import { Alert } from "@opsboard/ui/components/alert";
import { Button } from "@opsboard/ui/components/button";
import { Spinner } from "@opsboard/ui/components/spinner";

import { z } from "zod";

import { useVoiceRecorder } from "@/components/voice/use-voice-recorder";
import { Waveform } from "@/components/voice/waveform";
import type { AiProvider } from "@/components/keys/api-keys";

// The wizard's "try your keys" step. Records a clip with the shared
// use-voice-recorder hook, POSTs it to /api/setup/dictation-test (the EPHEMERAL
// transcribe→classify pipeline — writes nothing), and renders the transcript +
// the non-executing parsed `example`. A clean result proves BOTH keys work and
// is what unlocks the Finish step.
//
// Error handling (all graceful, all offer retry):
//   • mic permission denied → clear "allow microphone access" message,
//   • 402 NO_AI_KEY / a vendor key-rejection (400) → bubbled up via
//     onKeyProblem so the wizard can send the user back to the keys step with
//     the provider + message,
//   • generic transcription/parser failures → an inline alert.

const ENDPOINT = "/api/setup/dictation-test";

// Validate the endpoint's JSON at the boundary (repo guideline) rather than
// type-casting it.
const DictationTestResultSchema = z.object({
  transcript: z.string(),
  example: z.string(),
});
const DictationErrorSchema = z.object({
  error: z.string().optional(),
  code: z.string().optional(),
  provider: z.enum(["anthropic", "groq"]).optional(),
});

/** The success shape from /api/setup/dictation-test. */
type DictationTestResult = z.infer<typeof DictationTestResultSchema>;

/** A provider-scoped key problem the parent (wizard) routes back to the keys step. */
export interface KeyProblem {
  provider: AiProvider;
  message: string;
}

export interface DictationTestProps {
  /** Called once a clip transcribes + parses cleanly (both keys proven good). */
  onSuccess: (result: DictationTestResult) => void;
  /** Called on a 402 NO_AI_KEY or a vendor key-rejection — send user to keys. */
  onKeyProblem: (problem: KeyProblem) => void;
}

export function DictationTest({ onSuccess, onKeyProblem }: DictationTestProps) {
  // Browser IANA tz, resolved once — same contract as the voice controller.
  const tz = React.useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  const [result, setResult] = React.useState<DictationTestResult | null>(null);
  const [postError, setPostError] = React.useState<string | null>(null);

  // The recorder owns mic + MediaRecorder state; `onBlob` owns the POST. We keep
  // the latest callbacks in refs so onBlob stays referentially stable for the
  // hook (whose start/stop close over it) without re-subscribing.
  const onSuccessRef = React.useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onKeyProblemRef = React.useRef(onKeyProblem);
  onKeyProblemRef.current = onKeyProblem;

  const onBlob = React.useCallback(
    async (blob: Blob, mimeType: string) => {
      setPostError(null);
      setResult(null);

      const form = new FormData();
      const ext = mimeType.includes("mp4") ? "m4a" : "webm";
      form.append("audio", new File([blob], `setup-test.${ext}`, { type: mimeType }));
      form.append("tz", tz);

      let res: Response;
      try {
        res = await fetch(ENDPOINT, { method: "POST", body: form });
      } catch {
        // Transport failure (offline, DNS, aborted) — fetch rejects; surface it
        // as a retryable inline error instead of an unhandled rejection.
        setPostError("Network error — check your connection and try again.");
        return;
      }

      if (!res.ok) {
        const errParse = DictationErrorSchema.safeParse(
          await res.json().catch(() => null),
        );
        const data = errParse.success ? errParse.data : {};

        // 402 NO_AI_KEY — that provider's key isn't stored. Send the user back
        // to the keys step (the route tells us which provider).
        if (res.status === 402 && data?.code === "NO_AI_KEY" && data.provider) {
          onKeyProblemRef.current({
            provider: data.provider,
            message: `Add your ${data.provider} key first, then try the test again.`,
          });
          return; // resolve → recorder lands on idle, not the retry state
        }

        // 400 with a provider — the vendor rejected the key (bad/expired key).
        // Send the user back to fix THAT provider.
        if (res.status === 400 && data?.provider) {
          onKeyProblemRef.current({
            provider: data.provider,
            message:
              data.error ?? `That ${data.provider} key was rejected — re-check it.`,
          });
          return;
        }

        // Everything else (413/415/502/generic 400) → inline retryable error.
        setPostError(data?.error ?? `The test failed (${res.status}). Try again.`);
        return;
      }

      const parsed = DictationTestResultSchema.safeParse(
        await res.json().catch(() => null),
      );
      if (!parsed.success) {
        setPostError("The test returned an unexpected response. Try again.");
        return;
      }
      setResult(parsed.data);
      onSuccessRef.current(parsed.data);
    },
    [tz],
  );

  const { state, error, start, stop, reset, analyser } = useVoiceRecorder({
    onBlob,
  });

  const isRecording = state === "recording";
  const isProcessing = state === "processing" || state === "requesting";

  // Mic-permission / device errors come from the hook's `state === "error"`.
  // Map NotAllowedError to clear "allow microphone access" guidance.
  const micError =
    state === "error"
      ? error === "Microphone permission denied"
        ? "Microphone access was blocked. Allow microphone access in your browser, then try again."
        : (error ?? "Couldn't access the microphone. Try again.")
      : null;

  function handlePress() {
    if (isRecording) {
      stop();
    } else {
      setPostError(null);
      if (state === "error") reset();
      void start();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-subtitle font-bold text-card-foreground">
          Try it out
        </h2>
        <p className="text-label text-muted-foreground">
          Tap record and say something like{" "}
          <span className="font-medium text-foreground">
            &ldquo;create a mission called Book the trip&rdquo;
          </span>
          . Nothing is saved — this just proves your keys work.
        </p>
      </div>

      {/* Live waveform while recording (the hook exposes the analyser). */}
      {isRecording ? (
        <div className="rounded-none border border-border bg-muted p-3">
          <Waveform analyser={analyser} active={isRecording} />
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={isRecording ? "destructive" : "primary"}
          onClick={handlePress}
          disabled={isProcessing}
        >
          {isRecording ? (
            <>
              <Square aria-hidden="true" /> Stop
            </>
          ) : (
            <>
              <Mic aria-hidden="true" /> {result ? "Record again" : "Record"}
            </>
          )}
        </Button>
        {isProcessing ? (
          <Spinner label="TRANSCRIBING…" tone="muted" size={18} />
        ) : null}
      </div>

      {micError ? (
        <Alert variant="destructive" title="Microphone blocked">
          {micError}
        </Alert>
      ) : null}

      {postError ? (
        <Alert variant="destructive" title="Test failed">
          {postError}
        </Alert>
      ) : null}

      {result ? (
        <div className="flex flex-col gap-2 rounded-none border border-border bg-muted p-4">
          <span className="font-mono text-eyebrow font-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Heard
          </span>
          <p className="text-body text-foreground">
            &ldquo;{result.transcript}&rdquo;
          </p>
          <span className="mt-1 font-mono text-eyebrow font-semibold uppercase tracking-[1.5px] text-primary">
            Parsed
          </span>
          <p className="text-body text-foreground">{result.example}</p>
        </div>
      ) : null}
    </div>
  );
}
