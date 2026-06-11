"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Mic, Rocket } from "lucide-react";

import { Alert } from "@opsboard/ui/components/alert";
import { Button } from "@opsboard/ui/components/button";
import { Divider } from "@opsboard/ui/components/divider";

import { SetupShell } from "@/components/setup/setup-shell";
import { ProviderKeyField } from "@/components/keys/provider-key-field";
import {
  DictationTest,
  type KeyProblem,
} from "@/components/setup/dictation-test";
import type {
  AiProvider,
  ApiKeysSnapshot,
  ProviderKeyState,
} from "@/components/keys/api-keys";

// The gated BYO-keys onboarding wizard. Three steps, all on one centred card:
//   1. KEYS  — store the Anthropic + Groq keys (PUT /api/user/api-keys).
//   2. TEST  — prove the keys work with a live dictation round-trip
//              (POST /api/setup/dictation-test, EPHEMERAL).
//   3. FINISH — POST /api/setup/complete to flip the gate, then replace("/").
//
// The steps gate forward: TEST is reachable only once BOTH keys are stored;
// FINISH is reachable only once a test has succeeded. A 402/key-rejection from
// the test bounces the user back to KEYS with the offending provider flagged.

type Step = "keys" | "test" | "finish";

const STEPS: { key: Step; label: string }[] = [
  { key: "keys", label: "Keys" },
  { key: "test", label: "Test" },
  { key: "finish", label: "Finish" },
];

export function SetupWizard({ initialKeys }: { initialKeys: ApiKeysSnapshot }) {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("keys");
  const [keys, setKeys] = React.useState<ApiKeysSnapshot>(initialKeys);
  const [testPassed, setTestPassed] = React.useState(false);
  const [keysNotice, setKeysNotice] = React.useState<string | null>(null);
  const [finishing, setFinishing] = React.useState(false);
  const [finishError, setFinishError] = React.useState<string | null>(null);

  const bothKeysStored = keys.anthropic?.configured && keys.groq?.configured;

  function setProviderKey(provider: AiProvider, state: ProviderKeyState | null) {
    setKeys((prev) => ({ ...prev, [provider]: state }));
    // Editing keys invalidates a prior passing test (the proof is stale).
    setTestPassed(false);
    setKeysNotice(null);
  }

  // The dictation test bounced us back here for a provider key problem.
  const handleKeyProblem = React.useCallback((problem: KeyProblem) => {
    setKeysNotice(problem.message);
    setTestPassed(false);
    setStep("keys");
  }, []);

  const handleTestSuccess = React.useCallback(() => {
    setTestPassed(true);
  }, []);

  async function handleFinish() {
    setFinishError(null);
    setFinishing(true);
    try {
      const res = await fetch("/api/setup/complete", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
          missing?: { anthropic: boolean; groq: boolean };
        } | null;
        // The gate route says a key is missing — go back to KEYS.
        if (res.status === 400 && data?.missing) {
          setKeysNotice(data.error ?? "Add both keys first.");
          setStep("keys");
          setFinishing(false);
          return;
        }
        setFinishError(data?.error ?? `Couldn't finish setup (${res.status}).`);
        setFinishing(false);
        return;
      }
      // Gate is open — go to the board. refresh() so the RSC gate re-reads.
      router.replace("/");
      router.refresh();
    } catch {
      setFinishError("Network error — please try again.");
      setFinishing(false);
    }
  }

  const subtitle =
    step === "keys"
      ? "Bring your own keys to power voice commands."
      : step === "test"
        ? "Make sure your keys actually work."
        : "You're all set.";

  return (
    <SetupShell subtitle={subtitle}>
      <div className="flex flex-col gap-5">
        <StepRail current={step} />

        {step === "keys" ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-2 text-subtitle font-bold text-card-foreground">
                <KeyRound aria-hidden="true" className="size-4 text-primary" />
                Add your AI keys
              </h2>
              <p className="text-label text-muted-foreground">
                OpsBoard never ships its own keys — you bring an Anthropic key
                (for understanding commands) and a Groq key (for transcription).
                Both are encrypted at rest and never shown back to you.
              </p>
            </div>

            {keysNotice ? (
              <Alert variant="warning" title="Check your keys">
                {keysNotice}
              </Alert>
            ) : null}

            <ProviderKeyField
              provider="anthropic"
              state={keys.anthropic}
              onChange={(s) => setProviderKey("anthropic", s)}
            />
            <Divider />
            <ProviderKeyField
              provider="groq"
              state={keys.groq}
              onChange={(s) => setProviderKey("groq", s)}
            />

            <Button
              type="button"
              className="w-full"
              onClick={() => setStep("test")}
              disabled={!bothKeysStored}
            >
              {bothKeysStored ? "Continue to the test" : "Add both keys to continue"}
              {bothKeysStored ? <ArrowRight aria-hidden="true" /> : null}
            </Button>
          </div>
        ) : null}

        {step === "test" ? (
          <div className="flex flex-col gap-5">
            <DictationTest
              onSuccess={handleTestSuccess}
              onKeyProblem={handleKeyProblem}
            />

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep("keys")}
              >
                Back to keys
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => setStep("finish")}
                disabled={!testPassed}
              >
                {testPassed ? "Looks good — continue" : "Run the test to continue"}
                {testPassed ? <ArrowRight aria-hidden="true" /> : null}
              </Button>
            </div>
          </div>
        ) : null}

        {step === "finish" ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/12">
                <Rocket aria-hidden="true" className="size-6 text-primary" />
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-subtitle font-bold text-card-foreground">
                  Keys verified
                </h2>
                <p className="text-label text-muted-foreground">
                  Your keys work and are stored encrypted. Enter OpsBoard and
                  speak your first mission.
                </p>
              </div>
            </div>

            {finishError ? (
              <Alert variant="destructive" title="Couldn't finish">
                {finishError}
              </Alert>
            ) : null}

            <Button
              type="button"
              className="w-full"
              onClick={() => void handleFinish()}
              disabled={finishing}
            >
              {finishing ? (
                "Entering…"
              ) : (
                <>
                  <Mic aria-hidden="true" /> Enter OpsBoard
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep("test")}
              disabled={finishing}
            >
              Back to the test
            </Button>
          </div>
        ) : null}
      </div>
    </SetupShell>
  );
}

/** A compact 3-step progress rail (mono caps, primary on the active step). */
function StepRail({ current }: { current: Step }) {
  const activeIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        return (
          <li key={s.key} className="flex flex-1 items-center gap-2">
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-micro font-bold ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isDone
                    ? "bg-primary/12 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`font-mono text-eyebrow font-semibold uppercase tracking-[1.5px] ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="ml-1 h-px flex-1 bg-border" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
