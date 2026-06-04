import { redirect } from "next/navigation";
import { auth } from "@/lib/neon-auth";

// Reads the session cookie (possibly set moments earlier by the verifier
// exchange in middleware), so it can't be statically prerendered.
export const dynamic = "force-dynamic";

/**
 * Bare /auth landing. Authenticated users go home; everyone else is sent to
 * the sign-in form. This is also the path the page gate (middleware) and any
 * future social callback return to, so it must resolve a session here rather
 * than assume one way or the other.
 */
export default async function AuthRootPage() {
  const { data: session } = await auth.getSession();
  if (session?.user) redirect("/");
  redirect("/auth/sign-in");
}
