declare const _default: {
    CONTRACT_STATUS: {
        readonly START: "start";
        readonly AMEND: "amend";
        readonly END: "end";
    };
    LEAVE_CALCULATION_METHODS_CONSTANTS: {
        readonly DAYS_PER_YEAR_365: "daysPerYear365";
        readonly LEAVE_ENTITLEMENT_LEAVE_TAKEN: "leaveEntitlementLeaveTaken";
        readonly DAYS_ACCRUED_30DAYS: "daysAccrued30days";
        readonly DAYS_ACCRUED_31DAYS: "daysAccrued31days";
        readonly DAYS_ACCRUED_12_365DAYS: "daysAccrued12365days";
        readonly DAYS_ACCRUED_DAYS_WORKED: "daysAccruedDaysWorked";
        readonly DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION: "daysAccruedDaysWorkedBasedOnRotation";
    };
    SALARY_CALCULATION_METHODS_CONSTANTS: {
        readonly SALARY_30DAYS: "salary30days";
        readonly SALARY_31DAYS: "salary31days";
        readonly SALARY_12_365DAYS: "salary12*365days";
        readonly SALARY_DAY_RATE: "dayRate";
    };
    LEAVE_CALCULATION_METHODS: {
        readonly annual: readonly [{
            readonly label: "Days Per Year ÷ 365";
            readonly value: "daysPerYear365";
        }, {
            readonly label: "Leave Entitlement - Leave Taken";
            readonly value: "leaveEntitlementLeaveTaken";
        }];
        readonly monthly: readonly [{
            readonly label: "Days Accrued ÷ 30days";
            readonly value: "daysAccrued30days";
        }, {
            readonly label: "Days Accrued ÷ 31days";
            readonly value: "daysAccrued31days";
        }, {
            readonly label: "Days Accrued x 12 ÷ 365days";
            readonly value: "daysAccrued12365days";
        }];
        readonly daily: readonly [{
            readonly label: "Days Accrued x Days Worked";
            readonly value: "daysAccruedDaysWorked";
        }];
        readonly rotation: readonly [{
            readonly label: "Days Accrued x Days Worked Based on Rotation";
            readonly value: "daysAccruedDaysWorkedBasedOnRotation";
        }];
    };
    DISPLAY_WORKING_DAYS: readonly ["daily", "rotation"];
    MONTHS_ARRAY: readonly ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
};
export default _default;
//# sourceMappingURL=constant.d.ts.map