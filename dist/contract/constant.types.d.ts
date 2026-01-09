import ContractConstants from "./constant.js";
export type ContractStatusType = (typeof ContractConstants.CONTRACT_STATUS)[keyof typeof ContractConstants.CONTRACT_STATUS];
export type SalaryCalculationType = (typeof ContractConstants.SALARY_CALCULATION_METHODS_CONSTANTS)[keyof typeof ContractConstants.SALARY_CALCULATION_METHODS_CONSTANTS];
export type LeaveType = (typeof ContractConstants.LEAVE_TYPES)[keyof typeof ContractConstants.LEAVE_TYPES];
export type LeaveCalculationMethodType = (typeof ContractConstants.LEAVE_CALCULATION_METHODS)[keyof typeof ContractConstants.LEAVE_CALCULATION_METHODS];
export type EmploymentStatusType = (typeof ContractConstants.EMPLOYMENT_STATUS)[keyof typeof ContractConstants.EMPLOYMENT_STATUS];
export type ContractType = (typeof ContractConstants.CONTRACT_TYPES)[keyof typeof ContractConstants.CONTRACT_TYPES];
//# sourceMappingURL=constant.types.d.ts.map