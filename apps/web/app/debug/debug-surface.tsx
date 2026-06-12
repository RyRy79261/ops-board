"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Copy, Check, Trash2 } from "lucide-react";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { DebugInfoRow } from "@opsboard/ui/components/debug-info-row";
import { ErrorLogRow } from "@opsboard/ui/components/error-log-row";
import { EmptyState } from "@opsboard/ui/components/empty-state";

import {
  readErrorLog,
  clearErrorLog,
  type ClientErrorEntry,
} from "@/lib/client-error-log";

// Diagnostics surface. REAL, not a mock: server info (env/build/session) is
// seeded from the RSC; client info (tz/viewport/online/UA) is read in the
// browser; recent errors come from the genuine client error buffer. "Copy
// diagnostics" puts it all on the clipboard for issue reports.

export interface ServerDiag {
  env: string;
  commit: string;
  email: string;
  userId: string;
}

function fmtTime(t: number): string {
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function DebugSurface({ server }: { server: ServerDiag }) {
  const [client, setClient] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<ClientErrorEntry[]>([]);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setClient({
      Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      Viewport: `${window.innerWidth}×${window.innerHeight}`,
      Online: navigator.onLine ? "yes" : "no",
      Language: navigator.language,
      "User agent": navigator.userAgent,
    });
    setErrors(readErrorLog());
  }, []);

  const diagnostics = React.useMemo(
    () => ({
      env: server.env,
      build: server.commit,
      session: { email: server.email, userId: server.userId },
      client,
      recentErrors: errors,
    }),
    [server, client, errors],
  );

  async function copyDiagnostics() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  function clearErrors() {
    clearErrorLog();
    setErrors([]);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        right={
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings">
              <ArrowLeft aria-hidden="true" /> Settings
            </Link>
          </Button>
        }
      />
      <main className="flex flex-1 justify-center p-6">
        <div className="flex w-full max-w-lg flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <Eyebrow as="h1" tone="foreground" weight={700} tracking={2}>
              Diagnostics
            </Eyebrow>
            <Button variant="outline" size="sm" onClick={copyDiagnostics}>
              {copied ? (
                <Check aria-hidden="true" />
              ) : (
                <Copy aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy diagnostics"}
            </Button>
          </div>

          <section className="flex flex-col gap-2">
            <Eyebrow as="h2" tone="subtle" weight={700} tracking={2}>
              System
            </Eyebrow>
            <div className="flex flex-col gap-px border border-border">
              <DebugInfoRow label="Env" value={server.env} />
              <DebugInfoRow label="Build" value={server.commit} />
              {Object.entries(client).map(([k, v]) => (
                <DebugInfoRow key={k} label={k} value={v} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <Eyebrow as="h2" tone="subtle" weight={700} tracking={2}>
              Session
            </Eyebrow>
            <div className="flex flex-col gap-px border border-border">
              <DebugInfoRow label="Email" value={server.email} />
              <DebugInfoRow label="User id" value={server.userId} />
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Eyebrow as="h2" tone="subtle" weight={700} tracking={2}>
                Recent errors ({errors.length})
              </Eyebrow>
              {errors.length > 0 ? (
                <Button variant="ghost" size="sm" onClick={clearErrors}>
                  <Trash2 aria-hidden="true" /> Clear
                </Button>
              ) : null}
            </div>
            {errors.length === 0 ? (
              <EmptyState
                surface="background"
                message="NO ERRORS THIS SESSION"
                hint="Uncaught errors will show up here."
                className="border border-border"
              />
            ) : (
              <div className="flex flex-col divide-y divide-border border border-border">
                {errors.map((e, i) => (
                  <ErrorLogRow
                    key={`${e.t}-${i}`}
                    time={fmtTime(e.t)}
                    level={e.level}
                    message={e.message}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
