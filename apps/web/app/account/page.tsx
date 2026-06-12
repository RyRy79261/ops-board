import { getUserRow } from "@opsboard/db/api-keys";
import { getSessionUser } from "@/lib/session";
import { AccountSurface } from "./account-surface";

// /account — read-only profile + session + danger zone (export / delete). Uses
// getSessionUser (auth only, not requireOnboardedUser) so it's reachable mid-
// setup like the other settings surfaces. force-dynamic: per-user DB read.
export const dynamic = "force-dynamic";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Format the account creation date as `Member since 03 Jun 2026`. */
function formatMemberSince(createdAt: Date | undefined): string | undefined {
  if (!createdAt) return undefined;
  const day = String(createdAt.getUTCDate()).padStart(2, "0");
  return `Member since ${day} ${MONTHS[createdAt.getUTCMonth()]} ${createdAt.getUTCFullYear()}`;
}

export default async function AccountPage() {
  const { userId, email } = await getSessionUser();
  const row = await getUserRow(userId);
  return (
    <AccountSurface
      email={email ?? row?.email ?? ""}
      memberSince={formatMemberSince(row?.createdAt)}
    />
  );
}
