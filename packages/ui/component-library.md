# @opsboard/ui — Component Library (S1)

*Generated from the built components. 21 components on the OpsBoard token system (`src/styles/globals.css`). Contracts: `docs/tech-spec/02-components/`. Build sources per `docs/scaffolding-plan.md` reuse manifest.*

| Component | File | Client | Composes | Source | Exports |
|---|---|---|---|---|---|
| **Button** | `components/button.tsx` |  | — | LIFT (camp-404) | `Button`, `buttonVariants`, `ButtonProps` |
| **IconButton** | `components/icon-button.tsx` | ✓ | — | NEW | `IconButton`, `iconButtonVariants`, `IconButtonProps` |
| **Badge** | `components/badge.tsx` |  | — | ADAPT (camp-404) | `Badge`, `badgeVariants`, `BadgeProps` |
| **CategoryTag** | `components/category-tag.tsx` |  | Badge | NEW | `CategoryTag`, `categoryTagVariants`, `CategoryTagProps` |
| **WindowStatePill** | `components/window-state-pill.tsx` |  | Badge | NEW | `WindowStatePill`, `windowStatePillVariants`, `WindowStatePillProps`, `WindowState` |
| **StatusBadge** | `components/status-badge.tsx` |  | Badge | NEW | `StatusBadge`, `statusBadgeVariants`, `StatusBadgeProps` |
| **StatusCycleButton** | `components/status-cycle-button.tsx` | ✓ | — | LIFT (camp-404) | `StatusCycleButton`, `Touch44`, `statusCycleButtonVariants`, `StatusCycleButtonProps`, `Touch44Props`, `StatusCycleStatus` |
| **StatusDot** | `components/status-dot.tsx` |  | — | NEW | `StatusDot`, `statusDotVariants`, `StatusDotProps` |
| **Divider** | `components/divider.tsx` |  | — | LIFT (camp-404) | `Divider`, `DividerProps` |
| **Eyebrow** | `components/eyebrow.tsx` |  | — | NEW | `Eyebrow`, `eyebrowVariants`, `EyebrowProps` |
| **Card** | `components/card.tsx` |  | — | LIFT (camp-404) | `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`, `cardVariants`, `CardProps` |
| **StatTile** | `components/stat-tile.tsx` |  | — | ADAPT (camp-404) | `StatTile`, `StatTileProps`, `statTileVariants`, `statValueVariants`, `statLabelVariants` |
| **ProgressBar** | `components/progress-bar.tsx` |  | — | ADAPT (camp-404) | `ProgressBar`, `progressBarVariants`, `ProgressBarProps`, `ProgressSegment` |
| **NavCard** | `components/nav-card.tsx` |  | Card (recipe) | ADAPT (camp-404) | `NavCard`, `navCardVariants`, `chipVariants`, `NavCardProps`, `NavCardChip`, `NavCardChipTone` |
| **Alert** | `components/alert.tsx` |  | — | LIFT (camp-404) | `Alert`, `alertVariants`, `AlertProps` |
| **EmptyState** | `components/empty-state.tsx` |  | Card (shell recipe — shares bg-card + border-border + shadow-e1, sharp radius-0) | ADAPT (camp-404) | `EmptyState`, `emptyStateVariants`, `EmptyStateProps` |
| **Skeleton** | `components/skeleton.tsx` |  | Card (recipe — shares the sharp 1px-border $card shell, not imported) | NEW | `Skeleton`, `SkeletonRow`, `skeletonVariants`, `skeletonBlockVariants`, `SkeletonProps` |
| **Spinner** | `components/spinner.tsx` |  | — | LIFT (camp-404) | `Spinner`, `spinnerGlyphVariants`, `spinnerLabelVariants`, `SpinnerProps` |
| **Toast** | `components/toast.tsx` | ✓ | Button | ADAPT (camp-404) | `toast`, `Toaster`, `ToastItem`, `getToasts`, `ToastVariant`, `ToastRecord`, `ToastOptions`, `ToastAction`, `ToastPick`, `ToastItemProps`, `ToasterProps` |
| **ViewTabs** | `components/view-tabs.tsx` | ✓ | cva, cn | ADAPT (camp-404) | `ViewTabs`, `viewTabsListVariants`, `viewTabsTriggerVariants`, `DEFAULT_TABS`, `ViewTabValue`, `ViewTab`, `ViewTabsProps` |
| **Dialog** | `components/dialog.tsx` | ✓ | Button | LIFT (camp-404) | `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger` |

## Imports

```ts
import { Button } from "@opsboard/ui/components/button";
import { cn } from "@opsboard/ui/lib/utils";
import { useNowTick } from "@opsboard/ui/hooks/use-now-tick";
import "@opsboard/ui/styles.css"; // token system (app layout)
```

## Notes
- **Radius-0** everywhere; `rounded-full` only on dots / pill badges / avatars / voice FAB; StatusCycleButton is an 18px square.
- Tints: `bg-{token}/12` fill, `/18` hover-lift, `/40` same-hue outline on tinted surfaces (see foundations §5).
- Client components (state/Radix/handlers) carry `"use client"`; presentational leaves stay RSC-compatible.
- Storybook: `pnpm --filter @opsboard/ui storybook`. Stories co-located as `*.stories.tsx`.

Deferred to later stages: TaskCard / MissionSummaryCard + the 3 view organisms + chrome (AppHeader/Sidebar/MissionDetailHeader/CategoryGroupHeader) → S4; form atoms (TextInput/Select/Switch/…) → their P2 surfaces; voice/AI molecules (VoiceFAB/RecordingPanel/…) → S5.