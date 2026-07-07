import type { Task } from "@opsboard/db/schema";

/**
 * The board-shaped, client-safe task view — same field set the MCP tools
 * return (lib/mcp/tools/opsboard.ts toTaskView), so a consumer can switch
 * transports without remapping.
 */
export function toTaskView(t: Task) {
  return {
    id: t.id,
    missionId: t.missionId,
    name: t.name,
    categoryId: t.categoryId,
    status: t.status,
    tooLateBy: t.tooLateBy,
    notBefore: t.notBefore,
    notes: t.notes,
    sortOrder: t.sortOrder,
  };
}
