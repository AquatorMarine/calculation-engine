export const CONTRACT_STATUS = {
  START: "start",
  AMEND: "amend",
  END: "end",
} as const;

export const LEAVE_CALCULATION_METHODS_CONSTANTS = {
  DAYS_PER_YEAR_365: "daysPerYear365",
  LEAVE_ENTITLEMENT_LEAVE_TAKEN: "leaveEntitlementLeaveTaken",
  DAYS_ACCRUED_30DAYS: "daysAccrued30days",
  DAYS_ACCRUED_31DAYS: "daysAccrued31days",
  DAYS_ACCRUED_12_365DAYS: "daysAccrued12365days",
  DAYS_ACCRUED_DAYS_WORKED: "daysAccruedDaysWorked",
  DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION:
    "daysAccruedDaysWorkedBasedOnRotation",
} as const;

export const SALARY_CALCULATION_METHODS_CONSTANTS = {
  SALARY_30DAYS: "salary30days",
  SALARY_31DAYS: "salary31days",
  SALARY_12_365DAYS: "salary12*365days",
  SALARY_DAY_RATE: "dayRate",
} as const;

export const LEAVE_TYPES = {
  ANNUAL: "annual",
  MONTHLY: "monthly",
  DAILY: "daily",
  ROTATION: "rotation",
} as const;


export const LEAVE_CALCULATION_METHODS = {
  [LEAVE_TYPES.ANNUAL]: [
    {
      label: "Days Per Year ÷ 365",
      value: LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_PER_YEAR_365,
    },
    {
      label: "Leave Entitlement - Leave Taken",
      value: LEAVE_CALCULATION_METHODS_CONSTANTS.LEAVE_ENTITLEMENT_LEAVE_TAKEN,
    },
  ],
  [LEAVE_TYPES.MONTHLY]: [
    {
      label: "Days Accrued ÷ 30days",
      value: LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_30DAYS,
    },
    {
      label: "Days Accrued ÷ 31days",
      value: LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_31DAYS,
    },
    {
      label: "Days Accrued x 12 ÷ 365days",
      value: LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_12_365DAYS,
    },
  ],
  [LEAVE_TYPES.DAILY]: [
    {
      label: "Days Accrued x Days Worked",
      value: LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED,
    },
  ],
  [LEAVE_TYPES.ROTATION]: [
    {
      label: "Days Accrued x Days Worked Based on Rotation",
      value:
        LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION,
    },
  ],
} as const;

export const CONTRACT_TYPES = {
  STANDARD: "standard",
  ROTATION: "rotation",
  DAYWORKER: "dayworker",
  TEMPORARY: "temporary",
} as const;

export const DISPLAY_WORKING_DAYS = [LEAVE_TYPES.DAILY, LEAVE_TYPES.ROTATION] as const;

const ContractConstants = {
  LEAVE_TYPES,
  CONTRACT_STATUS,
  LEAVE_CALCULATION_METHODS_CONSTANTS,
  SALARY_CALCULATION_METHODS_CONSTANTS,
  LEAVE_CALCULATION_METHODS,
  DISPLAY_WORKING_DAYS,
  CONTRACT_TYPES,
};

export { ContractConstants };
