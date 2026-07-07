"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Alert } from "@opsboard/ui/components/alert";
import { Button } from "@opsboard/ui/components/button";
import { Card, CardContent } from "@opsboard/ui/components/card";
import { CodeCallout } from "@opsboard/ui/components/code-callout";
import { Divider } from "@opsboard/ui/components/divider";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { TextInput } from "@opsboard/ui/components/text-input";

// /settings/api-access client surface. Create keys (the plaintext is shown
// EXACTLY ONCE in the callout below the form — it can never be retrieved
// again), list them (name + display prefix + timestamps; never the secret),
// and revoke. Mutations bubble into local state so the list stays live.

export interface AccessKeyView {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export function ApiAccessSettings({
  initialKeys,
}: {
  initialKeys: AccessKeyView[];
}) {
  const [keys, setKeys] = React.useState<AccessKeyView[]>(initialKeys);
  const [name, setName] = React.useState("");
  const [minted, setMinted] = React.useState<{
    name: string;
    plaintext: string;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function createKey() {
    const trimmed = name.trim();
    if (!trimmed || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/user/access-keys", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });
        const body = (await res.json().catch(() => null)) as {
          key?: AccessKeyView;
          plaintext?: string;
          error?: string;
        } | null;
        if (!res.ok || !body?.key || !body.plaintext) {
          throw new Error(body?.error ?? `Create failed (${res.status})`);
        }
        setKeys((prev) => [body.key!, ...prev]);
        setMinted({ name: body.key.name, plaintext: body.plaintext });
        setName("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn’t create the key.");
      }
    });
  }

  function revokeKey(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/user/access-keys/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`Revoke failed (${res.status})`);
        const revokedAt = new Date().toISOString();
        setKeys((prev) =>
          prev.map((k) => (k.id === id ? { ...k, revokedAt } : k)),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn’t revoke the key.");
      }
    });
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
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Eyebrow as="h1" tone="foreground" weight={700} tracking={2}>
              API Access
            </Eyebrow>
            <p className="text-label text-muted-foreground">
              Keys let your own apps call the OpsBoard REST API
              (`/api/v1`) as you. Each key is shown once at creation —
              only a fingerprint is stored.
            </p>
          </div>

          {error ? (
            <Alert variant="destructive" title="Something went wrong">
              {error}
            </Alert>
          ) : null}

          <Card className="overflow-hidden p-0">
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <TextInput
                    label="New key name"
                    placeholder="e.g. van-build console"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createKey();
                    }}
                    disabled={pending}
                  />
                </div>
                <Button
                  onClick={createKey}
                  disabled={pending || name.trim().length === 0}
                >
                  Create
                </Button>
              </div>

              {minted ? (
                <Alert title={`Key created: ${minted.name}`}>
                  <div className="flex flex-col gap-2">
                    <p className="text-label">
                      Copy it now — it will never be shown again.
                    </p>
                    <CodeCallout mono>{minted.plaintext}</CodeCallout>
                  </div>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card className="overflow-hidden p-0">
            <CardContent className="flex flex-col gap-4 p-6">
              {keys.length === 0 ? (
                <p className="text-label text-muted-foreground">
                  No keys yet.
                </p>
              ) : (
                keys.map((k, i) => (
                  <React.Fragment key={k.id}>
                    {i > 0 ? <Divider /> : null}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-sm font-medium">
                          {k.name}
                        </span>
                        <span className="text-label text-muted-foreground">
                          {k.prefix} · created{" "}
                          {new Date(k.createdAt).toLocaleDateString()}
                          {k.revokedAt
                            ? " · revoked"
                            : k.lastUsedAt
                              ? ` · last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                              : " · never used"}
                        </span>
                      </div>
                      {k.revokedAt ? null : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeKey(k.id)}
                          disabled={pending}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </React.Fragment>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
