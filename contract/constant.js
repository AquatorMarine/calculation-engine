const CONTRACT_STATUS = {
    START: "start",
    AMEND: "amend",
    END: "end",
  };
  
  const LEAVE_CALCULATION_METHODS_CONSTANTS = {
    DAYS_PER_YEAR_365: "daysPerYear365",
    LEAVE_ENTITLEMENT_LEAVE_TAKEN: "leaveEntitlementLeaveTaken",
    DAYS_ACCRUED_30DAYS: "daysAccrued30days",
    DAYS_ACCRUED_31DAYS: "daysAccrued31days",
    DAYS_ACCRUED_12_365DAYS: "daysAccrued12365days",
    DAYS_ACCRUED_DAYS_WORKED: "daysAccruedDaysWorked",
    DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION:
      "daysAccruedDaysWorkedBasedOnRotation",
  };
  
  const SALARY_CALCULATION_METHODS_CONSTANTS = {
    SALARY_30DAYS: "salary30days",
    SALARY_31DAYS: "salary31days",
    SALARY_12_365DAYS: "salary12*365days",
    SALARY_DAY_RATE: "dayRate",
  };
  
  const LEAVE_CALCULATION_METHODS = {
    annual: [
      {
        label: "Days Per Year ÷ 365",
        value: LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_PER_YEAR_365,
      },
      {
        label: "Leave Entitlement - Leave Taken",
        value: LEAVE_CALCULATION_METHODS_CONSTANTS.LEAVE_ENTITLEMENT_LEAVE_TAKEN,
      },
    ],
    monthly: [
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
    daily: [
      {
        label: "Days Accrued x Days Worked",
        value: LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED,
      },
    ],
    rotation: [
      {
        label: "Days Accrued x Days Worked Based on Rotation",
        value:
          LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION,
      },
    ],
  };
  
  const DISPLAY_WORKING_DAYS = ["daily", "rotation"];
  
  const MONTHS_ARRAY = [
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
  
  export default {
    CONTRACT_STATUS,
    LEAVE_CALCULATION_METHODS_CONSTANTS,
    SALARY_CALCULATION_METHODS_CONSTANTS,
    LEAVE_CALCULATION_METHODS,
    DISPLAY_WORKING_DAYS,
    MONTHS_ARRAY,
  };
  