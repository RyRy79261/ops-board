"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Alert } from "@opsboard/ui/components/alert";
import { Button } from "@opsboard/ui/components/button";
import { TextInput } from "@opsboard/ui/components/text-input";
import { authClient } from "@/lib/auth-client";

/**
 * Email/password sign-in. OPEN signup model — no invite code, no whitelist.
 * Uses Neon Auth's Better Auth client directly (authClient.signIn.email).
 */

function safeCallbackUrl(raw: string | null | undefined): string {
  // Only allow same-origin relative paths; reject protocol-relative (//evil).
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = safeCallbackUrl(searchParams.get("callbackURL"));
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If we already have a session (e.g. landed back here authenticated), and a
  // non-default callback was requested, forward immediately.
  useEffect(() => {
    if (sessionPending || !session?.user || callbackURL === "/") return;
    window.location.replace(callbackURL);
  }, [sessionPending, session, callbackURL]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError("Email is required");
    if (!password) return setError("Password is required");

    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: trimmedEmail,
        password,
        callbackURL,
      });
      if (result && "error" in result && result.error) {
        setError(result.error.message ?? "Sign in failed");
        setLoading(false);
        return;
      }
      router.replace(callbackURL);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-subtitle font-bold text-card-foreground">
          Welcome back
        </h1>
        <p className="text-label text-muted-foreground">
          Sign in to your OpsBoard account.
        </p>
      </div>

      <TextInput
        id="signin-email"
        label="Email Address"
        size="lg"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <TextInput
        id="signin-password"
        label="Password"
        size="lg"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      {error && (
        <Alert variant="destructive" title="Sign in failed">
          {error}
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-label text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          className="font-medium text-primary hover:underline"
          href="/auth/sign-up"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
