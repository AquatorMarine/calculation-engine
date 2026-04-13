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
export declare function calculateAddonProration(params: {
    currentPeriodStart: number;
    currentPeriodEnd?: number;
    now?: number;
    entries: {
        amount: number;
        quantity: number;
    }[];
}): number;
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
export declare function calculateUpgradeProration(params: {
    currentPeriodStart: number;
    currentPeriodEnd?: number;
    billingFrequency: string;
    currentTotalCost: number;
    newTotalCost: number;
    now?: number;
}): UpgradeProrationResult;
//# sourceMappingURL=proration.d.ts.map