/**
 * @opsboard/ui — axe-core structural a11y gate (S8: "axe-core a11y +
 * redundant-channel audit"; docs/tech-spec/a11y-audit.md).
 *
 * Renders the KEY components with @testing-library/react and asserts axe finds
 * no violations. The gate is scoped to STRUCTURAL rules — roles, accessible
 * names, aria-*, label/control association, list/landmark semantics, and
 * button-vs-div. The `color-contrast` rule is DISABLED here on purpose: the
 * tactical-orange-on-near-black palette is LOCKED (design-brief §3 / LOCKED
 * tokens) and operator/Pencil-owned, so it is not this suite's to change. The
 * contrast pairs that would fail WCAG AA are surfaced as design-review items in
 * docs/tech-spec/a11y-audit.md instead.
 */
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Settings, Mic, X } from "lucide-react";

import { Button } from "../components/button";
import { IconButton } from "../components/icon-button";
import { Badge } from "../components/badge";
import { CategoryTag } from "../components/category-tag";
import {
  WindowStatePill,
  type WindowState,
} from "../components/window-state-pill";
import { StatusBadge } from "../components/status-badge";
import {
  StatusCycleButton,
  Touch44,
  type StatusCycleStatus,
} from "../components/status-cycle-button";
import { StatusDot } from "../components/status-dot";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/card";
import { StatTile } from "../components/stat-tile";
import { ProgressBar } from "../components/progress-bar";
import { NavCard } from "../components/nav-card";
import { Alert } from "../components/alert";
import { EmptyState } from "../components/empty-state";
import { Spinner } from "../components/spinner";
import { ToastItem, type ToastRecord } from "../components/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/dialog";
import { AppHeader } from "../components/app-header";
import { Sidebar } from "../components/sidebar";
import { MissionDetailHeader } from "../components/mission-detail-header";
import { CategoryGroupHeader } from "../components/category-group-header";
import { TaskCard, type TaskVM } from "../components/task-card";
import { ViewTabs } from "../components/view-tabs";
import { VoiceFAB, type VoiceFabState } from "../components/voice-fab";
import { RecordingPanel } from "../components/recording-panel";

/**
 * STRUCTURAL gate config: assert roles / names / aria / associations / list +
 * landmark semantics, but NOT color contrast (LOCKED palette — see header).
 */
const AXE_OPTIONS = {
  rules: {
    "color-contrast": { enabled: false },
  },
} as const;

/** Render a node and assert axe reports no STRUCTURAL violations. */
async function expectNoA11yViolations(ui: React.ReactElement) {
  const { container } = render(ui);
  const results = await axe(container, AXE_OPTIONS);
  expect(results).toHaveNoViolations();
}

const CATEGORIES = [
  "medical",
  "bureaucratic",
  "travel",
  "gear",
  "tech",
] as const;

const WINDOW_STATES: WindowState[] = [
  "open",
  "closing",
  "closed",
  "not-yet",
  "blocked",
];

const STATUS_VALUES = ["not-started", "in-progress", "done"] as const;

const CYCLE_STATUSES: StatusCycleStatus[] = [
  "not-started",
  "in-progress",
  "done",
];

const VOICE_STATES: VoiceFabState[] = [
  "idle",
  "requesting",
  "recording",
  "processing",
  "error",
];

describe("a11y — atoms", () => {
  it("Button — all variants have an accessible name + button role", async () => {
    await expectNoA11yViolations(
      <div>
        <Button variant="primary">Confirm</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="outline">Settings</Button>
        <Button variant="ghost">Dismiss</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="link">Learn more</Button>
      </div>,
    );
  });

  it("IconButton — icon-only control carries a required aria-label", async () => {
    await expectNoA11yViolations(
      <div>
        <IconButton aria-label="Open settings" icon={Settings} variant="ghost" />
        <IconButton aria-label="Record voice command" icon={Mic} variant="primary" />
        <IconButton aria-label="Close panel" icon={X} variant="outline" />
      </div>,
    );
  });

  it("Badge — base variants", async () => {
    await expectNoA11yViolations(
      <div>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="muted">Muted</Badge>
        <Badge variant="accent" dot>
          Accent
        </Badge>
      </div>,
    );
  });

  it("CategoryTag — all 5 tones (pill + inline) carry icon + label text", async () => {
    await expectNoA11yViolations(
      <div>
        {CATEGORIES.map((c) => (
          <React.Fragment key={c}>
            <CategoryTag category={c} variant="pill" />
            <CategoryTag category={c} variant="inline" showDot />
            <CategoryTag category={c} variant="inline" dimmed />
          </React.Fragment>
        ))}
      </div>,
    );
  });

  it("WindowStatePill — every state across render modes", async () => {
    await expectNoA11yViolations(
      <div>
        {WINDOW_STATES.map((state) => (
          <React.Fragment key={state}>
            <WindowStatePill state={state} variant="bordered" showOpen />
            <WindowStatePill state={state} variant="tinted" showOpen />
            <WindowStatePill state={state} variant="bare" showOpen />
          </React.Fragment>
        ))}
        {/* overloads: countdown + trailing date */}
        <WindowStatePill state="closing" daysUntil={3} />
        <WindowStatePill state="closed" date="3 Jun" />
        <WindowStatePill state="not-yet" date="5 Jun" />
        <WindowStatePill state="open" date="12 Jun" />
      </div>,
    );
  });

  it("StatusBadge — all 3 stored statuses (bordered + tinted)", async () => {
    await expectNoA11yViolations(
      <div>
        {STATUS_VALUES.map((status) => (
          <React.Fragment key={status}>
            <StatusBadge status={status} variant="bordered" />
            <StatusBadge status={status} variant="tinted" />
          </React.Fragment>
        ))}
      </div>,
    );
  });

  it("StatusCycleButton — all 3 statuses, wrapped in a Touch44 target", async () => {
    await expectNoA11yViolations(
      <div>
        {CYCLE_STATUSES.map((status) => (
          <Touch44 key={status}>
            <StatusCycleButton status={status} onCycle={() => {}} />
          </Touch44>
        ))}
      </div>,
    );
  });

  it("StatusDot — decorative indicator (aria-hidden)", async () => {
    await expectNoA11yViolations(
      <div>
        <StatusDot tone="accent" />
        <StatusDot tone="success" />
        <StatusDot tone="warning" />
        <StatusDot tone="cat-medical" />
      </div>,
    );
  });

  it("Card — composed shell + heading/description semantics", async () => {
    await expectNoA11yViolations(
      <Card>
        <CardHeader>
          <CardTitle>Mission Alpha</CardTitle>
          <CardDescription>Read-only summary surface.</CardDescription>
        </CardHeader>
        <CardContent>Body content.</CardContent>
      </Card>,
    );
  });

  it("StatTile — labelled metric group", async () => {
    await expectNoA11yViolations(
      <div>
        <StatTile value={3} label="DONE" tone="success" />
        <StatTile value={1} label="BLOCKED" tone="destructive" />
        <StatTile value={2} label="CLOSING" tone="warning" />
        <StatTile value={11} label="TOTAL" tone="foreground" />
      </div>,
    );
  });

  it("ProgressBar — progressbar role + aria-value*", async () => {
    await expectNoA11yViolations(
      <div>
        <ProgressBar
          segments={[
            { tone: "success", value: 3 },
            { tone: "warning", value: 2 },
            { tone: "destructive", value: 1 },
          ]}
          total={11}
          label="3 done, 2 closing, 1 blocked of 11"
        />
        <ProgressBar indeterminate label="Researching" />
      </div>,
    );
  });

  it("NavCard — selectable list-item button with aria-current", async () => {
    await expectNoA11yViolations(
      <div>
        <NavCard name="Mission Alpha" done={3} total={11} active />
        <NavCard
          name="Mission Bravo"
          done={1}
          total={4}
          chip={{ label: "T-3d", tone: "warning" }}
        />
      </div>,
    );
  });

  it("Alert — all tones with role=alert/status", async () => {
    await expectNoA11yViolations(
      <div>
        <Alert variant="info" title="HEADS UP">
          An informational advisory.
        </Alert>
        <Alert variant="warning" title="WINDOW CLOSING">
          The window closes in 3 days.
        </Alert>
        <Alert variant="destructive" title="BLOCKED">
          Blocked by an upstream task.
        </Alert>
      </div>,
    );
  });

  it("EmptyState — status region with voice-first copy", async () => {
    await expectNoA11yViolations(
      <div>
        <EmptyState variant="no-missions" />
        <EmptyState variant="no-tasks" hintStyle="tokens" surface="background" />
      </div>,
    );
  });

  it("Spinner — status region with a label / sr-only fallback", async () => {
    await expectNoA11yViolations(
      <div>
        <Spinner label="PROCESSING COMMAND…" />
        <Spinner showLabel={false} label="Syncing" />
        <Spinner glyph="arc" label="Researching" />
      </div>,
    );
  });
});

describe("a11y — Toast (per-variant live semantics + dismiss control)", () => {
  const base = (over: Partial<ToastRecord>): ToastRecord => ({
    id: 1,
    variant: "info",
    header: "INFO",
    duration: Infinity,
    ...over,
  });

  it("success / info / error each render an accessible dismiss button", async () => {
    await expectNoA11yViolations(
      <div>
        <ToastItem
          toast={base({ id: 1, variant: "success", header: "✓ MARKED DONE", meta: "AUTO-DISMISS · 5S" })}
        />
        <ToastItem
          toast={base({ id: 2, variant: "info", header: "QUERY", body: "Result." })}
        />
        <ToastItem
          toast={base({ id: 3, variant: "error", header: "FAILED", body: "Something went wrong." })}
        />
      </div>,
    );
  });

  it("disambiguation — picks render as a proper list of buttons", async () => {
    await expectNoA11yViolations(
      <ToastItem
        toast={base({
          id: 4,
          variant: "disambiguation",
          header: "WHICH ONE?",
          picks: [
            { name: "Cardiology follow-up", code: "MED" },
            { name: "Visa renewal", code: "BUR" },
          ],
        })}
      />,
    );
  });

  it("needsConfirmation — action buttons carry accessible names", async () => {
    await expectNoA11yViolations(
      <ToastItem
        toast={base({
          id: 5,
          variant: "needsConfirmation",
          header: "CONFIRM DELETE",
          body: "Delete this task?",
          actions: [
            { label: "CONFIRM", intent: "confirm" },
            { label: "CANCEL", intent: "cancel" },
          ],
        })}
      />,
    );
  });
});

describe("a11y — Dialog (title association + close control)", () => {
  it("open dialog has a title, description, and labelled close", async () => {
    const { baseElement } = render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Which task did you mean?</DialogTitle>
            <DialogDescription>
              Your command matched more than one task.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>,
    );
    // Dialog content portals to document.body; scan the whole baseElement.
    const results = await axe(baseElement, AXE_OPTIONS);
    expect(results).toHaveNoViolations();
  });
});

describe("a11y — chrome organisms", () => {
  it("AppHeader — banner landmark, wordmark-only", async () => {
    await expectNoA11yViolations(<AppHeader />);
  });

  it("AppHeader — banner landmark with a right slot", async () => {
    await expectNoA11yViolations(<AppHeader right={<span>operator</span>} />);
  });

  it("Sidebar — nav landmark wrapping NavCard rows", async () => {
    await expectNoA11yViolations(
      <Sidebar>
        <NavCard name="Mission Alpha" done={3} total={11} active />
        <NavCard name="Mission Bravo" done={1} total={4} />
      </Sidebar>,
    );
  });

  it("MissionDetailHeader — header landmark with stats + progress", async () => {
    await expectNoA11yViolations(
      <MissionDetailHeader
        title="Mission Alpha"
        targetDate="12 Jun 2026"
        stats={{ done: 3, blocked: 1, closing: 2, total: 11 }}
        progress={{ done: 3, closing: 2, blocked: 1, total: 11 }}
      />,
    );
  });

  it("CategoryGroupHeader — heading + labelled count", async () => {
    await expectNoA11yViolations(
      <CategoryGroupHeader
        color="#e05a9f"
        label="MEDICAL"
        doneCount={2}
        totalCount={5}
      />,
    );
  });

  it("ViewTabs — tablist with role=tab + aria-selected (+ associated panels)", async () => {
    // ViewTabs' triggers carry aria-controls="view-panel-{value}". In real usage
    // the consumer renders the matching role=tabpanel; provide them here so the
    // reference resolves (aria-valid-attr-value).
    await expectNoA11yViolations(
      <div>
        <ViewTabs value="category" onValueChange={() => {}} />
        <div id="view-panel-category" role="tabpanel" aria-labelledby="view-tab-category">
          Category board
        </div>
        <div id="view-panel-timeline" role="tabpanel" aria-labelledby="view-tab-timeline" hidden>
          Timeline board
        </div>
        <div
          id="view-panel-dependencies"
          role="tabpanel"
          aria-labelledby="view-tab-dependencies"
          hidden
        >
          Dependencies board
        </div>
      </div>,
    );
  });
});

describe("a11y — TaskCard (the one interactive board row)", () => {
  const TZ = "Africa/Johannesburg";
  const NOW = Date.UTC(2026, 5, 4, 10, 0, 0); // 2026-06-04 fixed

  const makeTask = (over: Partial<TaskVM>): TaskVM => ({
    id: "t1",
    name: "Renew passport",
    status: "not-started",
    categorySlug: "bureaucratic",
    too_late_by: null,
    not_before: null,
    blocked: false,
    blockedByNames: [],
    ...over,
  });

  it("open / closing / closed / not-yet / blocked rows are all accessible", async () => {
    await expectNoA11yViolations(
      <div>
        <TaskCard task={makeTask({})} tz={TZ} now={NOW} onCycle={() => {}} />
        <TaskCard
          task={makeTask({ id: "t2", too_late_by: "2026-06-08", status: "in-progress" })}
          tz={TZ}
          now={NOW}
          onCycle={() => {}}
        />
        <TaskCard
          task={makeTask({ id: "t3", too_late_by: "2026-05-01", status: "done" })}
          tz={TZ}
          now={NOW}
          onCycle={() => {}}
        />
        <TaskCard
          task={makeTask({ id: "t4", not_before: "2026-07-01" })}
          tz={TZ}
          now={NOW}
          onCycle={() => {}}
        />
        <TaskCard
          task={makeTask({
            id: "t5",
            blocked: true,
            blockedByNames: ["Book flights"],
          })}
          tz={TZ}
          now={NOW}
          criticalPath
          onCycle={() => {}}
        />
      </div>,
    );
  });
});

describe("a11y — VoiceFAB (every state)", () => {
  it("idle / requesting / recording / processing / error all carry a name", async () => {
    for (const state of VOICE_STATES) {
      await expectNoA11yViolations(<VoiceFAB state={state} onPress={() => {}} />);
    }
  });
});

describe("a11y — RecordingPanel (every state)", () => {
  it("recording / transcribing / parsing announce via role=status", async () => {
    await expectNoA11yViolations(
      <div>
        <RecordingPanel state="recording" elapsedLabel="00:07" amplitudes={[0.2, 0.6, 0.9, 0.4]} />
        <RecordingPanel state="transcribing" elapsedLabel="00:12" />
        <RecordingPanel
          state="parsing"
          elapsedLabel="00:15"
          showTranscript
          transcript="Mark passport renewal as done."
          withAccent
        />
      </div>,
    );
  });
});
