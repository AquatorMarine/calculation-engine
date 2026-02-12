import { type Dayjs } from "dayjs";
import { LEAVE_COUNT_TYPES } from "../contract/constant.js";
import type { PayslipLike, TimeoffLike, ContractLike, PaySlipHistoryLike, WorkingDaysLike, ScheduleLike, AccrualSetsLike } from "./types.js";
export declare const isAbleToGenerateLeaveForSelectedDateRange: (payslips: PayslipLike[] | undefined, leaveStartDate: string | Date | undefined, leaveEndDate: string | Date | undefined) => boolean;
export declare const isThereAnyPendingLeaveBetweenSelectedPayslipDateRange: (timeoffs: TimeoffLike[] | undefined, startDate: string | Date | undefined, endDate: string | Date | undefined) => boolean;
export declare const deriveAccrualSets: (leaveSettings: Array<{
    leaveType?: string;
    accruable?: boolean;
}> | null) => {
    accruable: Set<string>;
    nonAccruable: Set<string>;
} | null;
export declare const getEffectiveContracts: (contracts: ContractLike[], payslipStart: string | Date | undefined, payslipEnd: string | Date | undefined) => Array<ContractLike & {
    effectiveFrom: string;
    effectiveTo: string;
}>;
export declare const contractToConsiderForLeaveCalculation: (filteredContracts: ContractLike[] | null | undefined) => ContractLike | undefined;
export declare const finalEffectiveDateFromContracts: (seaContracts: ContractLike[], dateRange: [string | Date | undefined, string | Date | undefined] | undefined) => {
    effective: Array<ContractLike & {
        effectiveFrom: string;
        effectiveTo: string;
    }>;
    getActiveContract: ContractLike | undefined;
};
export declare const getSegmentDateRange: (contract: ContractLike | null | undefined, index: number, allContracts: ContractLike[], payslipRange: [string | Date | undefined, string | Date | undefined] | undefined, dateReturn?: boolean, formatDate?: (d: Date) => string | Date) => string | {
    startDate: string | Date | null;
    endDate: string | Date | null;
};
export declare const getPayslipLeaveAdjustments: (paySlipHistory: PaySlipHistoryLike[] | null | undefined, activeContract: ContractLike | null | undefined) => number;
export declare const getActiveContractAtSpecificDate: (contracts: ContractLike[] | null | undefined, date: string | Date | undefined) => ContractLike | null;
export declare const getMaxWorkingDaysForMonth: (params: {
    year?: number;
    month?: number;
    hiredAt?: string | Date;
    expiryAt?: string | Date | null;
}) => number;
export declare const leaveCarriedOverFromPreviousYearFunction: (contract: ContractLike | null | undefined) => number | {
    leaveCarriedOver?: number;
};
export declare const getLeaveRenewalDateWithYear: (leaveRenewalDate: string | Date | undefined, toDate?: boolean, today?: Dayjs) => Date | Dayjs | null;
export declare const leaveAccrualStartDate: (activeContract: ContractLike | null | undefined) => Dayjs | null;
export declare const leaveAccrualEndDate: (timeoffs: TimeoffLike[] | null | undefined) => Date | null;
export declare const calculateWorkingDaysBetweenDatesForDaysWorked: (entitlement: number, startDate: string | Date, endDate: string | Date, workingDays?: WorkingDaysLike[]) => number;
export declare const getFilterdContractWithStartDateAndEndDate: (contracts: ContractLike[], startDate: string | Date | undefined, endDate: string | Date | undefined) => Array<ContractLike & {
    startDateForSegmentCalculation: string | Date | null;
    endDateForSegmentCalculation: string | Date | null;
}>;
export declare const calculateLeaveWithAccruableCommon: (timeoffs: TimeoffLike[] | null | undefined, activeContract: ContractLike | null | undefined, leaveType: string | undefined, nonAccruableLeaves: (Set<string> | false) | undefined, startDatem: string | Date | Dayjs | undefined, endDatem: string | Date | Dayjs | undefined, leaveCountType?: (typeof LEAVE_COUNT_TYPES)[keyof typeof LEAVE_COUNT_TYPES]) => number | Record<string, number> | Array<{
    x: string;
    y: number;
}>;
export declare const getDutyDays: (records: ScheduleLike[], fromDate: string | Date | Dayjs, toDate: string | Date | Dayjs, type: string, excludeTravel?: boolean, leaveCountType?: (typeof LEAVE_COUNT_TYPES)[keyof typeof LEAVE_COUNT_TYPES]) => number | {
    x: string;
    y: number;
}[];
export declare const getDailyAccruedLeaveNew: (method: string | undefined, enti: number | undefined, daysDiff?: number) => number;
export declare const getLeaveAccrualNew: (method: string | undefined, entitlement: number | undefined, startDate: string | Date | undefined, endDate: string | Date | undefined, workingDays: WorkingDaysLike[] | {
    schedules?: ScheduleLike[];
} | null | undefined, userId: string | undefined) => number;
export declare const calculateNonAccruableLeave: (timeoffs: TimeoffLike[] | null | undefined, activeContract: ContractLike | null | undefined, leaveType: string | undefined, accrualSets: AccrualSetsLike | null | undefined) => number;
export declare const totalLeaveTakenFromHireDateNew: (timeoffs: TimeoffLike[] | null | undefined, activeContract: ContractLike | null | undefined, startDatem: string | Date | Dayjs | undefined, endDatem: string | Date | Dayjs | undefined, workingDays: WorkingDaysLike[] | {
    schedules?: ScheduleLike[];
} | null | undefined, userId: string | undefined, leaveType?: string | undefined, leaveCountType?: (typeof LEAVE_COUNT_TYPES)[keyof typeof LEAVE_COUNT_TYPES]) => number | Array<{
    x: string;
    y: number;
}>;
export declare const calculateLeaveNew: (paySlipHistory: PaySlipHistoryLike[] | null | undefined, timeoffs: TimeoffLike[] | null | undefined, activeContract: ContractLike | null | undefined, workingDays: WorkingDaysLike[] | {
    schedules?: ScheduleLike[];
} | null | undefined, rotationWorkedDays: {
    schedules?: ScheduleLike[];
} | null | undefined, userId: string | undefined, startDate: string | Date | undefined, endDate: string | Date | undefined, accrualSets: AccrualSetsLike | null | undefined) => number;
export declare const getLeaveAccrualMultipleContracts: (contracts: ContractLike[], workingDays: WorkingDaysLike[] | {
    schedules?: ScheduleLike[];
} | null | undefined, startDate: string | Date | undefined, endDate: string | Date | undefined, userId: string | undefined, _timeoffs: unknown, filter?: boolean) => number;
export declare const totalLeaveTakenMultipleContracts: (timeoffs: TimeoffLike[] | null | undefined, contracts: ContractLike[], workingDays: WorkingDaysLike[] | {
    schedules?: ScheduleLike[];
} | null | undefined, rotationWorkedDays: {
    schedules?: ScheduleLike[];
} | null | undefined, startDate: string | Date | undefined, endDate: string | Date | undefined, leaveType: string | undefined, userId: string | undefined, filter?: boolean) => number;
export { LEAVE_COUNT_TYPES, MONTHS_ARRAY, allLeaveCalculationDecimalPlaces } from "../contract/constant.js";
//# sourceMappingURL=index.d.ts.map