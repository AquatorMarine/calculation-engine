"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allLeaveCalculationDecimalPlaces = exports.EXCLUDED_LEAVE_TYPES = exports.LEAVE_COUNT_TYPES = exports.MONTHS_ARRAY = void 0;
exports.MONTHS_ARRAY = [
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
exports.LEAVE_COUNT_TYPES = {
    MONTHLY: "monthly",
    TYPEWISE: "typewise",
    TOTAL: "total",
};
exports.EXCLUDED_LEAVE_TYPES = [
    "Sick Leave",
    "Study Leave",
    "Unpaid",
    "Shore Leave",
];
const allLeaveCalculationDecimalPlaces = (num) => {
    return parseFloat(num.toFixed(3));
};
exports.allLeaveCalculationDecimalPlaces = allLeaveCalculationDecimalPlaces;
