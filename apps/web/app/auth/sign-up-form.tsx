"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@opsboard/ui/components/alert";
import { Button } from "@opsboard/ui/components/button";
import { Divider } from "@opsboard/ui/components/divider";
import { OAuthButton } from "@opsboard/ui/components/google-button";
import { TextInput } from "@opsboard/ui/components/text-input";
import { authClient } from "@/lib/auth-client";

/**
 * Email/password sign-up. OPEN — anyone can create an account; there is no
 * invite code or email whitelist anywhere in the flow. Better Auth requires a
 * `name`, so we pass the email through as the name (a richer profile can be
 * collected by a later PR's setup wizard).
 */
export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError("Email is required");
    if (!password) return setError("Password is required");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: trimmedEmail,
        password,
        name: trimmedEmail,
        callbackURL: "/",
      });
      if (result && "error" in result && result.error) {
        setError(result.error.message ?? "Sign up failed");
        setLoading(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      // Aim the return trip at /auth (not /) so Neon Auth's verifier exchange
      // — which runs inside the proxy middleware on /auth/* — fires before we
      // read the session; /auth/page.tsx then forwards us home.
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign up failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-subtitle font-bold text-card-foreground">
          Create your account
        </h1>
        <p className="text-label text-muted-foreground">
          Set a password or continue with Google to start planning missions.
        </p>
      </div>

      <TextInput
        id="signup-email"
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
        id="signup-password"
        label="Password"
        size="lg"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <TextInput
        id="signup-confirm-password"
        label="Confirm Password"
        size="lg"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
      />

      {error && (
        <Alert variant="destructive" title="Sign up failed">
          {error}
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <div className="flex items-center gap-2.5">
        <Divider className="flex-1" />
        <span className="text-micro text-muted-foreground">
          Or continue with
        </span>
        <Divider className="flex-1" />
      </div>

      <OAuthButton onClick={handleGoogle} disabled={loading} />

      <p className="text-center text-label text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="font-medium text-primary hover:underline"
          href="/auth/sign-in"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
