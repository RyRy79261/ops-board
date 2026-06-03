/**
 * S0 placeholder home. The real read-only dashboard (3-pane shell + Category /
 * Timeline / Dependencies views + StatusCycleButton + voice FAB) is built in S4
 * from docs/tech-spec/03-surfaces/ once @opsboard/{ui,core,db} land (S1–S3).
 */
export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="font-[family-name:var(--font-jetbrains-mono)] text-2xl font-bold tracking-[0.25em]">
        <span className="text-[color:var(--color-primary)]">OPS</span>
        <span className="text-[color:var(--color-muted-foreground)]">BOARD</span>
      </h1>
      <p className="text-sm text-[color:var(--color-muted-foreground)]">
        Scaffold S0 — monorepo skeleton. Dashboard arrives in S4.
      </p>
    </main>
  );
}
