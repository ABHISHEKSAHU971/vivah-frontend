"use client";

/**
 * Tracks which wedding services a signed-in customer has already picked,
 * so we can show a progress strip across listing screens.
 */

export type PlanningStepId =
  | "venue"
  | "catering"
  | "decoration"
  | "dj"
  | "photographer"
  | "makeup";

export interface PlanningStepSelection {
  id: number | string;
  name: string;
  href?: string;
  meta?: string;
}

export type PlanningProgressState = Partial<Record<PlanningStepId, PlanningStepSelection>>;

export const PLANNING_STEPS: {
  id: PlanningStepId;
  label: string;
  href: string;
}[] = [
  { id: "venue", label: "Venue", href: "/venues" },
  { id: "catering", label: "Catering", href: "/services/catering" },
  { id: "decoration", label: "Decoration", href: "/services/decorations" },
  { id: "dj", label: "DJ & Sound", href: "/services/dj-sound" },
  { id: "photographer", label: "Photographer", href: "/services/photography" },
  { id: "makeup", label: "Makeup", href: "/services/makeup" },
];

const STORAGE_KEY = "pmv_planning_progress";

export function loadPlanningProgress(): PlanningProgressState {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlanningProgressState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function savePlanningProgress(next: PlanningProgressState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("pmv:planning-progress"));
  } catch {
    /* ignore */
  }
}

export function markPlanningStep(
  step: PlanningStepId,
  selection: PlanningStepSelection
): PlanningProgressState {
  const next = { ...loadPlanningProgress(), [step]: selection };
  savePlanningProgress(next);
  return next;
}

export function clearPlanningProgress(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("pmv:planning-progress"));
  } catch {
    /* ignore */
  }
}

export function planningDoneCount(state: PlanningProgressState): number {
  return PLANNING_STEPS.filter((s) => Boolean(state[s.id])).length;
}
