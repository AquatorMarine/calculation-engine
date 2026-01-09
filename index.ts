// Re-export everything from contract
export {
  ContractConstants,
  CONTRACT_STATUS,
  LEAVE_TYPES,
  LEAVE_CALCULATION_METHODS_CONSTANTS,
  SALARY_CALCULATION_METHODS_CONSTANTS,
  SALARY_CALCULATION,
  CONTRACT_TYPES,
  EMPLOYMENT_STATUS,
} from "./contract/constant.js";

export type {
  ContractStatusType,
  SalaryCalculationType,
  LeaveType,
  LeaveCalculationMethodType,
  EmploymentStatusType,
  ContractType,
} from "./contract/constant.types.js";

// Default export
import ContractConstants from "./contract/constant.js";
export default ContractConstants;
