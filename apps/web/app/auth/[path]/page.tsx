import { Suspense } from "react";
import { AuthView } from "@neondatabase/auth/react/ui";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "../sign-in-form";
import { SignUpForm } from "../sign-up-form";

// `dynamicParams` stays at its default (true) so any auth subpath Neon Auth
// redirects to (error states, provider-specific paths, password reset, …)
// renders via the AuthView fallback rather than 404ing.
export const dynamic = "force-dynamic";

/**
 * The credential surface. /auth/sign-in and /auth/sign-up render OpsBoard's
 * own email+password forms; every other Better Auth view (forgot/reset
 * password, callbacks, sign-out, magic-link) falls back to Neon Auth's hosted
 * UI. OPEN signup — there is no invite/whitelist gate before or after this.
 */
export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  if (path === "sign-up") {
    return (
      <AuthShell>
        <SignUpForm />
      </AuthShell>
    );
  }

  if (path === "sign-in") {
    return (
      <AuthShell>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </AuthShell>
    );
  }

  // Forgot/reset password, callback, sign-out, magic-link — Neon Auth's
  // hosted UI covers the side trips we haven't built bespoke screens for.
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-background px-6 py-12">
      <AuthView path={path} />
    </main>
  );
}
