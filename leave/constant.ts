export const MONTHS_ARRAY = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const LEAVE_COUNT_TYPES = {
  MONTHLY: "monthly",
  TYPEWISE: "typewise",
  TOTAL: "total",
} as const;

export const EXCLUDED_LEAVE_TYPES = [
  "Sick Leave",
  "Study Leave",
  "Unpaid",
  "Shore Leave",
] as const;

export const allLeaveCalculationDecimalPlaces = (num: number): number => {
  return parseFloat(num.toFixed(3));
};
