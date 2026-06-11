"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Card, CardContent } from "@opsboard/ui/components/card";
import { Divider } from "@opsboard/ui/components/divider";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";

import { ProviderKeyField } from "@/components/keys/provider-key-field";
import type {
  AiProvider,
  ApiKeysSnapshot,
  ProviderKeyState,
} from "@/components/keys/api-keys";

// /settings/keys client surface. Reuses the same ProviderKeyField the wizard
// uses (so save/clear/format logic lives in one place), here with the Clear
// (DELETE) affordance enabled. The raw key is never displayed — only the
// configured state + last4. Mutations are bubbled into local state so the
// last4 badges stay live without a reload.

export function KeysSettings({ initialKeys }: { initialKeys: ApiKeysSnapshot }) {
  const [keys, setKeys] = React.useState<ApiKeysSnapshot>(initialKeys);

  function setProviderKey(provider: AiProvider, state: ProviderKeyState | null) {
    setKeys((prev) => ({ ...prev, [provider]: state }));
  }

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
      <main className="flex flex-1 justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Eyebrow as="h1" tone="foreground" weight={700} tracking={2}>
              AI Keys
            </Eyebrow>
            <p className="text-label text-muted-foreground">
              OpsBoard runs on your own keys. They&apos;re encrypted at rest and
              never shown back to you — only the last four characters.
            </p>
          </div>

          <Card className="overflow-hidden p-0">
            <CardContent className="flex flex-col gap-5 p-6">
              <ProviderKeyField
                provider="anthropic"
                state={keys.anthropic}
                onChange={(s) => setProviderKey("anthropic", s)}
                allowClear
              />
              <Divider />
              <ProviderKeyField
                provider="groq"
                state={keys.groq}
                onChange={(s) => setProviderKey("groq", s)}
                allowClear
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
