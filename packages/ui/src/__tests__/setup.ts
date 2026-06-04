// Vitest setup for the @opsboard/ui a11y + redundant-channel suite.
//
// - Registers the vitest-axe matchers (`toHaveNoViolations`) on `expect`.
// - Augments vitest's `Assertion` type so the matcher is type-checked.
// - Auto-unmounts @testing-library/react renders between tests so each axe
//   pass sees a clean DOM (no leaked portals/toasts across cases).

import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "vitest-axe/matchers";
import type { AxeMatchers } from "vitest-axe/matchers";

expect.extend(matchers);

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

afterEach(() => {
  cleanup();
});
