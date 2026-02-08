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
];
export const LEAVE_COUNT_TYPES = {
    MONTHLY: "monthly",
    TYPEWISE: "typewise",
    TOTAL: "total",
};
export const EXCLUDED_LEAVE_TYPES = [
    "Sick Leave",
    "Study Leave",
    "Unpaid",
    "Shore Leave",
];
export const allLeaveCalculationDecimalPlaces = (num) => {
    return parseFloat(num.toFixed(3));
};
