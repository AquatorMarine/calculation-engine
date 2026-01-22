"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractConstants = exports.DISPLAY_WORKING_DAYS = exports.CONTRACT_TYPES = exports.LEAVE_CALCULATION_METHODS = exports.LEAVE_TYPES = exports.SALARY_CALCULATION_METHODS_CONSTANTS = exports.LEAVE_CALCULATION_METHODS_CONSTANTS = exports.CONTRACT_STATUS = void 0;
exports.CONTRACT_STATUS = {
    START: "start",
    AMEND: "amend",
    END: "end",
};
exports.LEAVE_CALCULATION_METHODS_CONSTANTS = {
    DAYS_PER_YEAR_365: "daysPerYear365",
    LEAVE_ENTITLEMENT_LEAVE_TAKEN: "leaveEntitlementLeaveTaken",
    DAYS_ACCRUED_30DAYS: "daysAccrued30days",
    DAYS_ACCRUED_31DAYS: "daysAccrued31days",
    DAYS_ACCRUED_12_365DAYS: "daysAccrued12365days",
    DAYS_ACCRUED_DAYS_WORKED: "daysAccruedDaysWorked",
    DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION: "daysAccruedDaysWorkedBasedOnRotation",
};
exports.SALARY_CALCULATION_METHODS_CONSTANTS = {
    SALARY_30DAYS: "salary30days",
    SALARY_31DAYS: "salary31days",
    SALARY_12_365DAYS: "salary12*365days",
    SALARY_DAY_RATE: "dayRate",
};
exports.LEAVE_TYPES = {
    ANNUAL: "annual",
    MONTHLY: "monthly",
    DAILY: "daily",
    ROTATION: "rotation",
};
exports.LEAVE_CALCULATION_METHODS = {
    [exports.LEAVE_TYPES.ANNUAL]: [
        {
            label: "Days Per Year ÷ 365",
            value: exports.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_PER_YEAR_365,
        },
        {
            label: "Leave Entitlement - Leave Taken",
            value: exports.LEAVE_CALCULATION_METHODS_CONSTANTS.LEAVE_ENTITLEMENT_LEAVE_TAKEN,
        },
    ],
    [exports.LEAVE_TYPES.MONTHLY]: [
        {
            label: "Days Accrued ÷ 30days",
            value: exports.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_30DAYS,
        },
        {
            label: "Days Accrued ÷ 31days",
            value: exports.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_31DAYS,
        },
        {
            label: "Days Accrued x 12 ÷ 365days",
            value: exports.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_12_365DAYS,
        },
    ],
    [exports.LEAVE_TYPES.DAILY]: [
        {
            label: "Days Accrued x Days Worked",
            value: exports.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED,
        },
    ],
    [exports.LEAVE_TYPES.ROTATION]: [
        {
            label: "Days Accrued x Days Worked Based on Rotation",
            value: exports.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION,
        },
    ],
};
exports.CONTRACT_TYPES = {
    STANDARD: "standard",
    ROTATION: "rotation",
    DAYWORKER: "dayworker",
    TEMPORARY: "temporary",
};
exports.DISPLAY_WORKING_DAYS = [exports.LEAVE_TYPES.DAILY, exports.LEAVE_TYPES.ROTATION];
const ContractConstants = {
    LEAVE_TYPES: exports.LEAVE_TYPES,
    CONTRACT_STATUS: exports.CONTRACT_STATUS,
    LEAVE_CALCULATION_METHODS_CONSTANTS: exports.LEAVE_CALCULATION_METHODS_CONSTANTS,
    SALARY_CALCULATION_METHODS_CONSTANTS: exports.SALARY_CALCULATION_METHODS_CONSTANTS,
    LEAVE_CALCULATION_METHODS: exports.LEAVE_CALCULATION_METHODS,
    DISPLAY_WORKING_DAYS: exports.DISPLAY_WORKING_DAYS,
    CONTRACT_TYPES: exports.CONTRACT_TYPES,
};
exports.ContractConstants = ContractConstants;
