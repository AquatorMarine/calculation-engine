import type { Dayjs } from "dayjs";

export interface PayslipLike {
  payslipStartDate?: string | Date;
  payslipEndDate?: string | Date;
}

export interface TimeoffLike {
  startDate?: string | Date;
  endDate?: string | Date;
  status?: string;
  type?: string;
  travelDays?: Array<{ dateRange: [string | Date, string | Date] }>;
}

export interface ContractLike {
  _id?: string;
  hiredAt?: string | Date;
  contractEffectiveDate?: string | Date;
  contractEndDateCalculated?: string | Date;
  contractEndDate?: string | Date;
  contractExpiryDate?: string | Date;
  contractStatus?: string;
  contractType?: string;
  leave?: {
    calculationMethod?: string;
    leaveEntitlement?: number;
    leaveRenewalDate?: string | Date;
  };
  leaveCarryOverHistory?: Array<{ leaveCarriedOver?: number }>;
  startDateForSegmentCalculation?: string | Date;
  endDateForSegmentCalculation?: string | Date;
}

export interface PaySlipHistoryLike {
  payoutObject?: {
    contractId?: string;
    leavePayoutDays?: number;
  };
}

export interface WorkingDaysLike {
  year: number;
  workingDays?: Record<number, number>;
}

export interface ScheduleLike {
  userId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  type?: string;
  travelDays?: Array<[string | Date, string | Date]>;
}

export interface AccrualSetsLike {
  accruable?: Set<string>;
  nonAccruable?: Set<string>;
}
