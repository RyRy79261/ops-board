"use client";

import * as React from "react";

// LIFTED + ADAPTED from camp-404 apps/web/components/voice/use-voice-recorder.ts
// (project_brief.md §3 / scaffolding-plan.md S5). The MediaRecorder state machine
// is preserved verbatim — including the four critical gotchas the brief flags:
//   1. iOS-Safari audio/mp4 MIME fallback (hardcoding audio/webm silently fails),
//   2. analyser fftSize = 1024,
//   3. 2-minute auto-stop,
//   4. unmount-safe cleanup (clear handlers BEFORE stop()).
//
// OPSBOARD CHANGE: the camp hook always POSTed the clip to /api/voice/transcribe
// and appended the returned text to a field. OpsBoard's board is READ-ONLY — the
// FAB must route the clip to /api/voice/command and surface a structured result,
// never append text. So delivery on stop() is now configurable:
//   • onBlob(blob, mimeType)  — full control; the FAB owns the POST + the
//     structured-response handling (transcript / intent / confirmation toast).
//   • endpoint + onResult     — the hook POSTs the FormData and hands back parsed
//     JSON (a thinner seam for callers that don't need the raw blob).
//   • onTranscript            — the legacy camp behaviour (default endpoint
//     /api/voice/transcribe, returns { text }); kept so plain dictation still
//     works if the hook is reused elsewhere.

export type RecorderState =
  | "idle"
  | "requesting"
  | "recording"
  | "processing"
  | "error";

export interface UseVoiceRecorderOptions {
  /**
   * Full-control delivery: called with the recorded blob once recording stops.
   * When provided it takes precedence over `endpoint`/`onTranscript` — the hook
   * does NOT post anything itself; the caller owns the network round-trip and
   * decides when to return to `idle` (resolve) or surface an error (throw/reject).
   * This is how the VoiceFAB routes to /api/voice/command and renders the
   * structured result (success / needsConfirmation / disambiguation / error).
   */
  onBlob?: (blob: Blob, mimeType: string) => void | Promise<void>;
  /**
   * Endpoint the hook POSTs the multipart clip to when `onBlob` is not given.
   * Defaults to the camp dictation route. For the OpsBoard command pipeline,
   * the FAB uses `onBlob` instead and posts to /api/voice/command itself.
   */
  endpoint?: string;
  /**
   * Called with the parsed JSON response when the hook owns the POST (i.e.
   * `onBlob` not given). Use this for a custom endpoint whose response is not
   * the legacy `{ text }` shape.
   */
  onResult?: (data: unknown) => void;
  /**
   * Legacy camp behaviour: called with the transcript text from a `{ text }`
   * response. Only used when neither `onBlob` nor `onResult` is provided.
   */
  onTranscript?: (text: string) => void;
  /**
   * Server-known prompt domain key. Echoed to the endpoint which looks up the
   * matching Whisper bias string server-side. Keep it on the server so the
   * client can't inject arbitrary prompts. Only sent when the hook owns the POST.
   */
  promptKey?: string;
  /** Hard cap on a single clip. Defaults to 2 minutes. */
  maxDurationMs?: number;
}

const DEFAULT_ENDPOINT = "/api/voice/transcribe";

const SUPPORTED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4", // iOS Safari 14.3+
  "audio/ogg;codecs=opus",
];

/**
 * Picks the first MIME type the current browser actually supports.
 * Hardcoding `audio/webm` makes iOS Safari silently fail — this is the
 * single biggest cross-browser gotcha per the voice brief.
 */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const t of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}

/**
 * Cross-browser MediaRecorder wrapper. Records on `start()`, delivers the clip
 * on `stop()` (via `onBlob`, a configured `endpoint`, or the legacy
 * `onTranscript` default), and exposes an `AnalyserNode` consumers can read to
 * draw a live waveform while recording. On native Capacitor builds the
 * start/stop calls should route through `@capgo/capacitor-voice-recorder`
 * instead — see the //TODO inside start().
 */
export function useVoiceRecorder({
  onBlob,
  endpoint = DEFAULT_ENDPOINT,
  onResult,
  onTranscript,
  promptKey,
  maxDurationMs = 120_000,
}: UseVoiceRecorderOptions = {}) {
  const [state, setState] = React.useState<RecorderState>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [analyser, setAnalyser] = React.useState<AnalyserNode | null>(null);

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = React.useRef(true);

  // Keep the latest callbacks in a ref so the unmount cleanup + the onstop
  // handler (which closes over the recorder created in start()) always call the
  // current props without re-subscribing the effect or re-creating start().
  const handlersRef = React.useRef({ onBlob, endpoint, onResult, onTranscript, promptKey });
  handlersRef.current = { onBlob, endpoint, onResult, onTranscript, promptKey };

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Critical cleanup per the voice brief: clear handlers BEFORE stop()
      // so a queued onstop doesn't setState on an unmounted component.
      const rec = recorderRef.current;
      if (rec) {
        rec.ondataavailable = null;
        rec.onstop = null;
        rec.onerror = null;
        if (rec.state !== "inactive") rec.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void audioCtxRef.current?.close();
      audioCtxRef.current = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function safeSet<T>(setter: (v: T) => void, value: T) {
    if (mountedRef.current) setter(value);
  }

  function teardownAudio() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    safeSet(setAnalyser, null);
  }

  async function start() {
    if (state === "recording" || state === "requesting") return;
    setError(null);
    safeSet(setState, "requesting");

    // TODO(capacitor): when running natively, swap MediaRecorder for the
    // capacitor-voice-recorder plugin (returns base64 m4a). Detect via
    // `Capacitor.isNativePlatform()`.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Analyser for the live waveform UI. fftSize 1024 per the voice
      // brief — large enough for a smooth wave, small enough that the
      // RAF loop stays cheap.
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createAnalyser();
      node.fftSize = 1024;
      source.connect(node);
      audioCtxRef.current = ctx;
      safeSet(setAnalyser, node);

      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = rec;
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onerror = () => {
        safeSet(setError, "Recording failed");
        safeSet(setState, "error");
        teardownAudio();
      };
      rec.onstop = () => {
        void handleStop(mimeType ?? rec.mimeType);
      };

      rec.start();
      safeSet(setState, "recording");
      timeoutRef.current = setTimeout(() => stop(), maxDurationMs);
    } catch (err) {
      const name = err instanceof Error ? err.name : "Error";
      const message =
        name === "NotAllowedError"
          ? "Microphone permission denied"
          : name === "NotFoundError"
            ? "No microphone found"
            : "Couldn't access microphone";
      safeSet(setError, message);
      safeSet(setState, "error");
      teardownAudio();
    }
  }

  function stop() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return;
    rec.stop();
  }

  async function handleStop(mimeType: string) {
    safeSet(setState, "processing");
    try {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      teardownAudio();
      recorderRef.current = null;

      if (blob.size === 0) {
        safeSet(setState, "idle");
        return;
      }

      const h = handlersRef.current;

      // Mode 1 — caller owns delivery. The FAB POSTs to /api/voice/command and
      // drives the structured-response toasts itself; the hook just returns to
      // idle (or to error if the caller throws).
      if (h.onBlob) {
        await h.onBlob(blob, mimeType);
        safeSet(setState, "idle");
        return;
      }

      // Mode 2/3 — the hook owns the multipart POST to `endpoint`.
      const form = new FormData();
      form.append(
        "audio",
        new File([blob], `clip.${mimeType.includes("mp4") ? "m4a" : "webm"}`, {
          type: mimeType,
        }),
      );
      if (h.promptKey) form.append("promptKey", h.promptKey);

      const res = await fetch(h.endpoint ?? DEFAULT_ENDPOINT, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      const data: unknown = await res.json();

      // Mode 2 — custom endpoint, hand back the parsed JSON.
      if (h.onResult) {
        h.onResult(data);
      } else if (h.onTranscript) {
        // Mode 3 — legacy camp { text } dictation shape.
        const text = (data as { text?: string }).text ?? "";
        if (text.trim()) h.onTranscript(text);
      }
      safeSet(setState, "idle");
    } catch (err) {
      safeSet(
        setError,
        err instanceof Error ? err.message : "Voice command failed",
      );
      safeSet(setState, "error");
    }
  }

  function reset() {
    setError(null);
    safeSet(setState, "idle");
  }

  return { state, error, start, stop, reset, analyser };
}
