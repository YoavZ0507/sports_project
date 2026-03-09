import { repository } from "@/lib/repositories/inMemoryRepository";
import type { DashboardSummary } from "@/lib/types";

export function getDashboard(workspaceId: string): DashboardSummary {
  return repository.getDashboardSummary(workspaceId, new Date().toISOString());
}
