const BILLING_PERIOD_SECONDS: Record<string, number> = {
  DAY: 1 * 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
  YEAR: 365 * 24 * 60 * 60,
};

/**
 * Calculates the prorated charge for a list of addon entries for the
 * remaining portion of the current billing period.
 *
 * @param params.currentPeriodStart - Unix timestamp (seconds) of period start
 * @param params.currentPeriodEnd   - Unix timestamp (seconds) of period end (optional)
 * @param params.now                - Current unix timestamp in seconds (defaults to Date.now() / 1000)
 * @param params.entries            - List of { amount, quantity } items to prorate
 * @returns Total prorated amount rounded to 2 decimal places
 */
export function calculateAddonProration(params: {
  currentPeriodStart: number;
  currentPeriodEnd?: number;
  now?: number;
  entries: { amount: number; quantity: number }[];
}): number {
  const now = params.now ?? Date.now() / 1000;
  const totalSeconds = Math.max(
    1,
    (params.currentPeriodEnd || now) - params.currentPeriodStart
  );
  const remainingSeconds = Math.max(
    0,
    (params.currentPeriodEnd || now) - now
  );
  const ratio = remainingSeconds / totalSeconds;

  let total = 0;
  for (const entry of params.entries) {
    total += entry.amount * entry.quantity * ratio;
  }
  return Number(total.toFixed(2));
}

export type UpgradeProrationResult = {
  currentTotalCost: number;
  unusedCredit: number;
  newTotalCost: number;
  amountDue: number;
  daysRemaining: number;
  totalDays: number;
};

/**
 * Calculates the prorated amount due when a subscriber upgrades their plan
 * mid-billing-period. The unused credit from the current plan offsets the
 * cost of the new plan for the remaining days.
 *
 * @param params.currentPeriodStart  - Unix timestamp (seconds) of period start
 * @param params.currentPeriodEnd    - Unix timestamp (seconds) of period end (optional)
 * @param params.billingFrequency    - "DAY" | "WEEK" | "MONTH" | "YEAR" (used as fallback when no periodEnd)
 * @param params.currentTotalCost    - Full cost of the current plan for the period
 * @param params.newTotalCost        - Full cost of the new plan for the period
 * @param params.now                 - Current unix timestamp in seconds (defaults to Date.now() / 1000)
 * @returns Breakdown including unusedCredit, amountDue, daysRemaining, totalDays
 */
export function calculateUpgradeProration(params: {
  currentPeriodStart: number;
  currentPeriodEnd?: number;
  billingFrequency: string;
  currentTotalCost: number;
  newTotalCost: number;
  now?: number;
}): UpgradeProrationResult {
  const now = params.now ?? Date.now() / 1000;
  const periodStart = params.currentPeriodStart;

  const fallbackPeriod =
    BILLING_PERIOD_SECONDS[params.billingFrequency] ??
    BILLING_PERIOD_SECONDS["MONTH"];
  const periodEnd = params.currentPeriodEnd || periodStart + fallbackPeriod;

  const totalSeconds = Math.max(1, periodEnd - periodStart);
  const elapsedSeconds = Math.min(Math.max(0, now - periodStart), totalSeconds);
  const remainingSeconds = totalSeconds - elapsedSeconds;

  const totalDays = Math.ceil(totalSeconds / (24 * 60 * 60));
  const daysRemaining = Math.ceil(remainingSeconds / (24 * 60 * 60));

  const unusedCredit = Number(
    (params.currentTotalCost * (remainingSeconds / totalSeconds)).toFixed(2)
  );

  const amountDue = Math.max(
    0,
    Number((params.newTotalCost - unusedCredit).toFixed(2))
  );

  return {
    currentTotalCost: params.currentTotalCost,
    unusedCredit,
    newTotalCost: params.newTotalCost,
    amountDue,
    daysRemaining,
    totalDays,
  };
}
