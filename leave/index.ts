import dayjs, { type Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import minMax from "dayjs/plugin/minMax";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import {
  LEAVE_CALCULATION_METHODS_CONSTANTS,
  CONTRACT_TYPES,
  CONTRACT_STATUS,
  MONTHS_ARRAY,
  LEAVE_COUNT_TYPES,
  EXCLUDED_LEAVE_TYPES,
  allLeaveCalculationDecimalPlaces,
} from "../contract/constant.js";
import type {
  PayslipLike,
  TimeoffLike,
  ContractLike,
  PaySlipHistoryLike,
  WorkingDaysLike,
  ScheduleLike,
  AccrualSetsLike,
} from "./types.js";

dayjs.extend(isBetween);
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const isEmpty = (arr: unknown[] | null | undefined): boolean =>
  !Array.isArray(arr) || arr.length === 0;

const defaultFormatDate = (d: Date): string => dayjs(d).format("YYYY-MM-DD");

export const isAbleToGenerateLeaveForSelectedDateRange = (
  payslips: PayslipLike[] = [],
  leaveStartDate: string | Date | undefined,
  leaveEndDate: string | Date | undefined
): boolean => {
  if (isEmpty(payslips)) return true;
  if (!leaveStartDate || !leaveEndDate) return false;
  const ls = dayjs(leaveStartDate);
  const le = dayjs(leaveEndDate);
  return !payslips.some((payslip) => {
    const psStart = dayjs(payslip.payslipStartDate);
    const psEnd = dayjs(payslip.payslipEndDate);
    if (!psStart.isValid() || !psEnd.isValid()) return false;
    return ls.isSameOrBefore(psEnd, "day") && le.isSameOrAfter(psStart, "day");
  });
};

export const isThereAnyPendingLeaveBetweenSelectedPayslipDateRange = (
  timeoffs: TimeoffLike[] = [],
  startDate: string | Date | undefined,
  endDate: string | Date | undefined
): boolean => {
  if (isEmpty(timeoffs)) return false;
  if (!startDate || !endDate) return false;
  const ls = dayjs(startDate);
  const le = dayjs(endDate);
  return timeoffs.some((timeoff) => {
    const toStart = dayjs(timeoff.startDate);
    const toEnd = dayjs(timeoff.endDate);
    if (!toStart.isValid() || !toEnd.isValid()) return false;
    return (
      ls.isSameOrBefore(toEnd, "day") &&
      le.isSameOrAfter(toStart, "day") &&
      timeoff.status !== "Approved"
    );
  });
};

export const deriveAccrualSets = (
  leaveSettings: Array<{ leaveType?: string; accruable?: boolean }> | null
): { accruable: Set<string>; nonAccruable: Set<string> } | null => {
  if (!leaveSettings || !Array.isArray(leaveSettings)) return null;
  const accruable = new Set<string>();
  const nonAccruable = new Set<string>();
  leaveSettings.forEach((s) => {
    if (!s || !s.leaveType) return;
    if (s.accruable) accruable.add(s.leaveType);
    else nonAccruable.add(s.leaveType);
  });
  return { accruable, nonAccruable };
};

export const getEffectiveContracts = (
  contracts: ContractLike[],
  payslipStart: string | Date | undefined,
  payslipEnd: string | Date | undefined
): Array<ContractLike & { effectiveFrom: string; effectiveTo: string }> => {
  if (!Array.isArray(contracts) || !payslipStart || !payslipEnd) return [];

  const pStart = dayjs(payslipStart);
  const pEnd = dayjs(payslipEnd);

  if (!pStart.isValid() || !pEnd.isValid() || pEnd.isBefore(pStart, "day")) return [];

  const effective: Array<ContractLike & { effectiveFrom: string; effectiveTo: string }> = [];

  for (const contract of contracts) {
    if (contract.contractStatus === CONTRACT_STATUS.END) continue;

    const start = dayjs(contract.hiredAt);
    if (!start.isValid()) continue;

    const end = contract.contractEndDateCalculated
      ? dayjs(contract.contractEndDateCalculated)
      : pEnd;

    if (!end.isValid()) continue;

    if (end.isBefore(start, "day")) continue;

    if (start.isSameOrBefore(pEnd, "day") && end.isSameOrAfter(pStart, "day")) {
      effective.push({
        ...contract,
        effectiveFrom: dayjs.max(start, pStart).toISOString(),
        effectiveTo: dayjs.min(end, pEnd).toISOString(),
      } as ContractLike & { effectiveFrom: string; effectiveTo: string });
    }

    if (start.isBefore(pStart, "day")) break;
  }

  return effective.reverse();
};

export const contractToConsiderForLeaveCalculation = (
  filteredContracts: ContractLike[] | null | undefined
): ContractLike | undefined => filteredContracts?.[filteredContracts?.length - 1];

export const finalEffectiveDateFromContracts = (
  seaContracts: ContractLike[],
  dateRange: [string | Date | undefined, string | Date | undefined] | undefined
): {
  effective: Array<ContractLike & { effectiveFrom: string; effectiveTo: string }>;
  getActiveContract: ContractLike | undefined;
} => {
  const effective = getEffectiveContracts(
    seaContracts,
    dateRange?.[0],
    dateRange?.[1]
  );
  const getActiveContract = contractToConsiderForLeaveCalculation(effective);
  return { effective, getActiveContract };
};

export const getSegmentDateRange = (
  contract: ContractLike | null | undefined,
  index: number,
  allContracts: ContractLike[],
  payslipRange: [string | Date | undefined, string | Date | undefined] | undefined,
  dateReturn = false,
  formatDate: (d: Date) => string | Date = defaultFormatDate
): string | { startDate: string | Date | null; endDate: string | Date | null } => {
  const format = (d: Dayjs) =>
    dateReturn ? d.format("YYYY-MM-DD") : formatDate(d.toDate());

  const payslipStart = payslipRange?.[0] ? dayjs(payslipRange[0]) : null;
  const payslipEnd = payslipRange?.[1] ? dayjs(payslipRange[1]) : null;
  const hiredAt = contract?.hiredAt ? dayjs(contract.hiredAt) : null;
  const nextHiredAt = allContracts[index + 1]?.hiredAt
    ? dayjs(allContracts[index + 1].hiredAt)
    : null;

  let startDate: Dayjs | null = null;

  if (payslipStart && hiredAt) {
    startDate = payslipStart.isAfter(hiredAt, "day") ? payslipStart : hiredAt;
  } else {
    startDate = payslipStart || hiredAt;
  }

  let endDate: Dayjs | null = null;

  if (payslipEnd && nextHiredAt) {
    endDate = payslipEnd.isBefore(nextHiredAt, "day")
      ? payslipEnd
      : nextHiredAt.subtract(1, "day");
  } else {
    endDate = payslipEnd || nextHiredAt;
  }

  if (!startDate) {
    return dateReturn
      ? { startDate: null, endDate: null }
      : "";
  }

  if (!endDate) {
    return dateReturn
      ? { startDate: format(startDate), endDate: new Date() }
      : `${format(startDate)} - Present`;
  }

  return dateReturn
    ? { startDate: format(startDate), endDate: format(endDate) }
    : `${format(startDate)} - ${format(endDate)}`;
};

export const getPayslipLeaveAdjustments = (
  paySlipHistory: PaySlipHistoryLike[] | null | undefined,
  activeContract: ContractLike | null | undefined
): number => {
  const filterPayslipHistory = paySlipHistory?.filter((payslip) => {
    return payslip.payoutObject?.contractId === activeContract?._id;
  });

  return (
    filterPayslipHistory?.reduce((acc, cur) => {
      return acc + (cur.payoutObject?.leavePayoutDays || 0);
    }, 0) || 0
  );
};

export const getActiveContractAtSpecificDate = (
  contracts: ContractLike[] | null | undefined,
  date: string | Date | undefined
): ContractLike | null => {
  if (!Array.isArray(contracts) || !date) return null;

  const target = dayjs(date);
  if (!target.isValid()) return null;

  const potentialContracts = contracts.filter((c) => {
    return (
      c.hiredAt &&
      dayjs(c.contractEffectiveDate || c.hiredAt).isSameOrBefore(target, "day")
    );
  });

  if (potentialContracts.length === 0) return null;

  const latestContract = potentialContracts.sort(
    (a, b) =>
      dayjs(b.contractEffectiveDate || b.hiredAt).valueOf() -
      dayjs(a.contractEffectiveDate || a.hiredAt).valueOf()
  )[0];

  if (latestContract.contractExpiryDate) {
    const expiry = dayjs(latestContract.contractExpiryDate).endOf("day");
    if (target.isAfter(expiry, "day")) {
      return null;
    }
  }

  return latestContract;
};

export const getMaxWorkingDaysForMonth = (params: {
  year?: number;
  month?: number;
  hiredAt?: string | Date;
  expiryAt?: string | Date | null;
}): number => {
  const { year, month, hiredAt, expiryAt } = params;
  if (!year || !month || !hiredAt) return 0;

  const hire = new Date(hiredAt);
  const hireYear = hire.getFullYear();
  const hireMonth = hire.getMonth() + 1;
  const hireDay = hire.getDate();

  if (!expiryAt) {
    if (year < hireYear || (year === hireYear && month < hireMonth)) {
      return 0;
    }

    const daysInMonth = new Date(year, month, 0).getDate();

    if (year === hireYear && month === hireMonth) {
      return daysInMonth - hireDay + 1;
    }

    return daysInMonth;
  }

  const expiry = new Date(expiryAt);
  const expiryYear = expiry.getFullYear();
  const expiryMonth = expiry.getMonth() + 1;
  const expiryDay = expiry.getDate();

  if (
    year < hireYear ||
    year > expiryYear ||
    (year === hireYear && month < hireMonth) ||
    (year === expiryYear && month > expiryMonth)
  ) {
    return 0;
  }

  const daysInMonth = new Date(year, month, 0).getDate();

  if (year === expiryYear && month === expiryMonth) {
    return expiryDay;
  }

  if (year === hireYear && month === hireMonth) {
    return daysInMonth - hireDay + 1;
  }

  return daysInMonth;
};

export const leaveCarriedOverFromPreviousYearFunction = (
  contract: ContractLike | null | undefined
): number | { leaveCarriedOver?: number } => {
  if (!contract) return 0;
  const leaveCarriedOverFromPreviousYear = contract?.leaveCarryOverHistory;
  if (
    !leaveCarriedOverFromPreviousYear ||
    isEmpty(leaveCarriedOverFromPreviousYear)
  )
    return 0;
  const lastLeaveCarriedOverFromPreviousYear =
    leaveCarriedOverFromPreviousYear[0];
  return lastLeaveCarriedOverFromPreviousYear;
};

export const getLeaveRenewalDateWithYear = (
  leaveRenewalDate: string | Date | undefined,
  toDate = false,
  today: Dayjs = dayjs()
): Date | Dayjs | null => {
  if (!leaveRenewalDate) return null;

  const renewalDate = dayjs(leaveRenewalDate);
  if (!renewalDate.isValid()) return null;

  const renewalMonth = renewalDate.month();
  const renewalDay = renewalDate.date();

  const renewalThisYear = today.month(renewalMonth).date(renewalDay);

  const finalDate = today.isBefore(renewalThisYear, "day")
    ? renewalThisYear
    : renewalThisYear.add(1, "year");
  return toDate ? finalDate.toDate() : finalDate;
};

export const leaveAccrualStartDate = (
  activeContract: ContractLike | null | undefined
): Dayjs | null => {
  if (!activeContract) return null;

  const today = dayjs();
  const leaveRenewalDateRaw = activeContract.leave?.leaveRenewalDate;
  const contractEffectiveDate = activeContract.contractEffectiveDate
    ? dayjs(activeContract.contractEffectiveDate)
    : null;
  const hiredAt = dayjs(activeContract.hiredAt);
  const segmentStart = activeContract.startDateForSegmentCalculation
    ? dayjs(activeContract.startDateForSegmentCalculation)
    : null;

  const leaveRenewalDate = getLeaveRenewalDateWithYear(
    leaveRenewalDateRaw,
    false,
    today
  );

  const convertToDayJs = dayjs(leaveRenewalDate);
  const removeOneYearFromLeaveRenewalDate = convertToDayJs.subtract(
    1,
    "year"
  );
  const compareDateWithHireDate =
    removeOneYearFromLeaveRenewalDate.isAfter(
      contractEffectiveDate || hiredAt,
      "day"
    );

  const hiredDate =
    today.isBefore(leaveRenewalDate, "day")
      ? compareDateWithHireDate
        ? removeOneYearFromLeaveRenewalDate
        : contractEffectiveDate || hiredAt
      : leaveRenewalDate;

  let finalDate: Dayjs = dayjs(hiredDate);

  if (segmentStart) {
    finalDate = dayjs(hiredDate).isAfter(segmentStart, "day")
      ? dayjs(hiredDate)
      : segmentStart;
  }
  return finalDate;
};

export const leaveAccrualEndDate = (
  timeoffs: TimeoffLike[] | null | undefined
): Date | null => {
  if (!timeoffs?.length) return dayjs().toDate();

  let maxEndDate: Dayjs | null = null;

  for (const timeoff of timeoffs) {
    if (timeoff?.endDate) {
      const current = dayjs(timeoff.endDate);
      if (!maxEndDate || current.isAfter(maxEndDate, "day")) {
        maxEndDate = current;
      }
    }
  }
  const currentEndDate = dayjs();
  return maxEndDate
    ? currentEndDate.isAfter(maxEndDate, "day")
      ? currentEndDate.toDate()
      : maxEndDate.toDate()
    : null;
};

export const calculateWorkingDaysBetweenDatesForDaysWorked = (
  entitlement: number,
  startDate: string | Date,
  endDate: string | Date,
  workingDays: WorkingDaysLike[] = []
): number => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (
    !workingDays?.length ||
    !start.isValid() ||
    !end.isValid() ||
    start.isAfter(end, "day")
  ) {
    return 0;
  }

  const workingDaysMap = new Map(
    workingDays?.map((wd) => [wd.year, wd.workingDays || {}])
  );

  let totalWorkingDays = 0;

  const startYear = start.year();
  const endYear = end.year();
  const startMonth = start.month() + 1;
  const endMonth = end.month() + 1;
  const startDay = start.date();
  const endDay = end.date();

  for (let year = startYear; year <= endYear; year++) {
    const monthsData = workingDaysMap.get(year);
    if (!monthsData) continue;

    const mStart = year === startYear ? startMonth : 1;
    const mEnd = year === endYear ? endMonth : 12;

    for (let month = mStart; month <= mEnd; month++) {
      const monthlyMax = Number(monthsData[month] ?? 0);
      if (monthlyMax <= 0) continue;
      if (
        year === startYear &&
        year === endYear &&
        month === startMonth
      ) {
        totalWorkingDays += Math.min(endDay - startDay + 1, monthlyMax);
      } else if (year === startYear && month === startMonth) {
        totalWorkingDays += Math.max(monthlyMax - (startDay - 1), 0);
      } else if (year === endYear && month === endMonth) {
        totalWorkingDays += Math.min(endDay, monthlyMax);
      } else {
        totalWorkingDays += monthlyMax;
      }
    }
  }

  const finalAccruedLeave = totalWorkingDays * entitlement;
  return finalAccruedLeave;
};

export const getFilterdContractWithStartDateAndEndDate = (
  contracts: ContractLike[],
  startDate: string | Date | undefined,
  endDate: string | Date | undefined
): Array<
  ContractLike & {
    startDateForSegmentCalculation: string | Date | null;
    endDateForSegmentCalculation: string | Date | null;
  }
> => {
  return contracts.map((contract, index) => {
    const dateRange = getSegmentDateRange(
      contract,
      index,
      contracts,
      [startDate, endDate],
      true
    );
    const range =
      typeof dateRange === "object" ? dateRange : { startDate: null, endDate: null };
    return {
      ...contract,
      startDateForSegmentCalculation: range?.startDate ?? null,
      endDateForSegmentCalculation: range?.endDate ?? null,
    } as ContractLike & {
      startDateForSegmentCalculation: string | Date | null;
      endDateForSegmentCalculation: string | Date | null;
    };
  });
};

export const calculateLeaveWithAccruableCommon = (
  timeoffs: TimeoffLike[] | null | undefined,
  activeContract: ContractLike | null | undefined,
  leaveType: string | undefined,
  nonAccruableLeaves: Set<string> | false = false,
  startDatem: string | Date | Dayjs | undefined,
  endDatem: string | Date | Dayjs | undefined,
  leaveCountType: (typeof LEAVE_COUNT_TYPES)[keyof typeof LEAVE_COUNT_TYPES] = LEAVE_COUNT_TYPES.TOTAL
): number | Record<string, number> | Array<{ x: string; y: number }> => {

  const globalStart = startDatem
    ? dayjs(startDatem)
    : dayjs(leaveAccrualStartDate(activeContract));

  const globalEnd = endDatem
    ? dayjs(endDatem)
    : dayjs(leaveAccrualEndDate(timeoffs));

  const monthWiseCounts = MONTHS_ARRAY.map((month) => ({
    x: month,
    y: 0,
  }));

  const typeWiseCounts: Record<string, number> = {};

  let totalLeaveCount = 0;

  timeoffs?.forEach((leave) => {
    const isApproved = leave.status === "Approved";
    const isTargetType = !leaveType || leave.type === leaveType;
    const isExcluded =
      !leaveType && (EXCLUDED_LEAVE_TYPES as readonly string[]).includes(leave.type ?? "");
    const finalCheck =
      nonAccruableLeaves === false
        ? !isExcluded
        : nonAccruableLeaves?.has(leave.type ?? "") ?? false;

    if (isApproved && isTargetType && finalCheck) {
      let currentDay = dayjs(leave.startDate);
      const leaveEndDate = dayjs(leave.endDate);

      while (currentDay.isSameOrBefore(leaveEndDate, "day")) {
        const inWindow = currentDay.isBetween(
          globalStart,
          globalEnd,
          "day",
          "[]"
        );

        if (inWindow) {
          const isTravelDay = leave.travelDays?.some((travel) => {
            if (!travel?.dateRange?.length) return false;
            const [tStart, tEnd] = travel?.dateRange ?? [];
            return currentDay.isBetween(dayjs(tStart), dayjs(tEnd), "day", "[]");
          });
          if (!isTravelDay) {
            totalLeaveCount++;
            if (leaveCountType === LEAVE_COUNT_TYPES.MONTHLY) {
              const monthIndex = currentDay.month();
              monthWiseCounts[monthIndex].y++;
            }
            if (leaveCountType === LEAVE_COUNT_TYPES.TYPEWISE) {
              const leaveTypeName = leave.type || "Unknown";
              typeWiseCounts[leaveTypeName] =
                (typeWiseCounts[leaveTypeName] || 0) + 1;
            }
          }
        }
        currentDay = currentDay.add(1, "day");
      }
    }
  });

  if (leaveCountType === LEAVE_COUNT_TYPES.TYPEWISE) {
    return typeWiseCounts;
  }
  if (leaveCountType === LEAVE_COUNT_TYPES.MONTHLY) {
    return monthWiseCounts;
  }
  return totalLeaveCount;
};

export const getAllTravelDays = (data: any[]): string[] => {
  const result: string[] = [];

  data.forEach((item) => {
    if (!item.travelDays || !Array.isArray(item.travelDays)) return;
    const [start, end] = item.travelDays;
    if (!start || !end) return;
    let current = dayjs(start);
    const last = dayjs(end);

    while (current.isSameOrBefore(last, "day")) {
      result.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }
  });


  // remove duplicates + sort
  return [...new Set(result)].sort();
};

function adjustEndDates(contracts: any[]) {
  // Sort by startDate to ensure correct order
  contracts.sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());

  for (let i = 0; i < contracts.length - 1; i++) {
    const current = contracts[i];
    const next = contracts[i + 1];

    if (!current.endDate || !next.startDate) continue;

    const currentEnd = dayjs(current.endDate);
    const nextStart = dayjs(next.startDate);

    // If current end equals next start
    if (currentEnd.isSame(nextStart, "day")) {
      current.endDate = currentEnd.subtract(1, "day").format("YYYY-MM-DD");
    }
  }

  return contracts;
}

export const getDutyDays = (
  records: ScheduleLike[],
  fromDate: string | Date | Dayjs,
  toDate: string | Date | Dayjs,
  type: string,
  excludeTravel = false,
  leaveCountType: (typeof LEAVE_COUNT_TYPES)[keyof typeof LEAVE_COUNT_TYPES] = LEAVE_COUNT_TYPES.TOTAL
): number | { x: string; y: number }[] => {
  const start = dayjs(fromDate);
  const end = dayjs(toDate);

  const monthWiseCounts = MONTHS_ARRAY.map((month) => ({
    x: month,
    y: 0,
  }));

  if (!Array.isArray(records) || records.length === 0) {
    return leaveCountType === LEAVE_COUNT_TYPES.MONTHLY
      ? monthWiseCounts
      : 0;
  }

  const record = records
    .slice()
    .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));

  const sortedRecords = adjustEndDates(record);
  const travelDays = getAllTravelDays(sortedRecords);
  const totalDutyDays = sortedRecords.reduce((total, rec, idx) => {
    if (rec.type !== type) return total;

    const rotationStart = dayjs(rec.startDate);
    let rotationEnd = rec.endDate
      ? dayjs(rec.endDate)
      : end; // use today if no endDate

    const overlapStart = dayjs.max(rotationStart, start);
    const overlapEnd = dayjs.min(rotationEnd, end);

    if (overlapStart.isSameOrBefore(overlapEnd, "day")) {
      let currentDay = overlapStart;
      let diffDays = 0;

      while (currentDay.isSameOrBefore(overlapEnd, "day")) {
        let isTravelDay = false;

        if (excludeTravel) {
          isTravelDay = travelDays.includes(currentDay.format("YYYY-MM-DD"));
        }

        if (!isTravelDay) {
          diffDays++;

          if (leaveCountType === LEAVE_COUNT_TYPES.MONTHLY) {
            const monthIndex = currentDay.month();
            monthWiseCounts[monthIndex].y++;
          }
        }

        currentDay = currentDay.add(1, "day");
      }

      return total + diffDays;
    }

    return total;
  }, 0);

  if (leaveCountType === LEAVE_COUNT_TYPES.MONTHLY) {
    return monthWiseCounts;
  }

  return totalDutyDays;
};

export const calculateRotationDays = (
  entitlement: number,
  startDate: string | Date | Dayjs,
  endDate: string | Date | Dayjs,
  workingDays: { schedules?: ScheduleLike[] } | null | undefined,
  userId: string | undefined,
  dutyType = "OnDuty",
  leaveCountType: (typeof LEAVE_COUNT_TYPES)[keyof typeof LEAVE_COUNT_TYPES] = LEAVE_COUNT_TYPES.TOTAL
): number | Array<{ x: string; y: number }> => {
  const userSchedules = workingDays?.schedules?.filter(
    (schedule) => schedule.userId === userId
  );

  if (!userSchedules?.length) {
    if (leaveCountType === LEAVE_COUNT_TYPES.MONTHLY) {
      return MONTHS_ARRAY.map((month) => ({ x: month, y: 0 }));
    }
    return 0;
  }
  const totalDays = getDutyDays(
    userSchedules,
    startDate,
    endDate,
    dutyType,
    true,
    leaveCountType
  );

  return Array.isArray(totalDays)
    ? totalDays.map((data) => ({
      x: data.x,
      y: allLeaveCalculationDecimalPlaces(Number(data.y) * Number(entitlement)),
    }))
    : Number(totalDays) * Number(entitlement);
};

export const getDailyAccruedLeaveNew = (
  method: string | undefined,
  enti: number | undefined,
  daysDiff = 1
): number => {
  if (!method || enti == null) return 0;
  let dailyLeave = 0;
  const entitlement = Number(enti);
  switch (method) {
    case LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_PER_YEAR_365:
      dailyLeave =
        allLeaveCalculationDecimalPlaces(entitlement / 365) * daysDiff;
      break;
    case LEAVE_CALCULATION_METHODS_CONSTANTS.LEAVE_ENTITLEMENT_LEAVE_TAKEN:
      dailyLeave = 0;
      break;
    case LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_30DAYS:
      dailyLeave = allLeaveCalculationDecimalPlaces(entitlement / 30) * daysDiff;
      break;
    case LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_31DAYS:
      dailyLeave = allLeaveCalculationDecimalPlaces(entitlement / 31) * daysDiff;
      break;
    case LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_12_365DAYS:
      dailyLeave =
        allLeaveCalculationDecimalPlaces((entitlement * 12) / 365) * daysDiff;
      break;
    case LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED:
      dailyLeave = +entitlement;
      break;
    case LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION:
      dailyLeave = +entitlement;
      break;
    default:
      return 0;
  }
  return allLeaveCalculationDecimalPlaces(dailyLeave);
};

export const getLeaveAccrualNew = (
  method: string | undefined,
  entitlement: number | undefined,
  startDate: string | Date | undefined,
  endDate: string | Date | undefined,
  workingDays: WorkingDaysLike[] | { schedules?: ScheduleLike[] } | null | undefined,
  userId: string | undefined
): number => {
  const endDateDayjs = dayjs(endDate ?? new Date());
  const startDateDayjs = dayjs(startDate);

  const daysDiff = endDateDayjs.diff(startDateDayjs, "day") + 1;

  let totalDays = 0;

  if (method === LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED) {
    totalDays = calculateWorkingDaysBetweenDatesForDaysWorked(
      entitlement ?? 0,
      startDate ?? "",
      endDate ?? "",
      Array.isArray(workingDays) ? workingDays : []
    );

    return totalDays;
  } else if (
    method ===
    LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION
  ) {
    totalDays = calculateRotationDays(
      entitlement ?? 0,
      startDate ?? "",
      endDate ?? "",
      !Array.isArray(workingDays) ? workingDays : null,
      userId
    ) as number;
  } else if (
    method === LEAVE_CALCULATION_METHODS_CONSTANTS.LEAVE_ENTITLEMENT_LEAVE_TAKEN
  ) {
    totalDays = entitlement ?? 0;
  } else {
    totalDays = getDailyAccruedLeaveNew(method, entitlement, daysDiff);
  }

  return totalDays;
};

export const calculateNonAccruableLeave = (
  timeoffs: TimeoffLike[] | null | undefined,
  activeContract: ContractLike | null | undefined,
  leaveType: string | undefined,
  accrualSets: AccrualSetsLike | null | undefined
): number => {
  const nonAccruableLeaves = accrualSets?.nonAccruable;

  const leaveCount = calculateLeaveWithAccruableCommon(
    timeoffs,
    activeContract,
    leaveType,
    nonAccruableLeaves ?? false,
    undefined,
    undefined,
    LEAVE_COUNT_TYPES.TOTAL
  ) as number;

  const totalLeaveToNonAccruable =
    leaveCount *
    getDailyAccruedLeaveNew(
      activeContract?.leave?.calculationMethod,
      activeContract?.leave?.leaveEntitlement
    );

  return totalLeaveToNonAccruable;
};

export const totalLeaveTakenFromHireDateNew = (
  timeoffs: TimeoffLike[] | null | undefined,
  activeContract: ContractLike | null | undefined,
  startDatem: string | Date | Dayjs | undefined,
  endDatem: string | Date | Dayjs | undefined,
  workingDays:
    | WorkingDaysLike[]
    | { schedules?: ScheduleLike[] }
    | null
    | undefined,
  userId: string | undefined,
  leaveType?: string | undefined,
  leaveCountType: (typeof LEAVE_COUNT_TYPES)[keyof typeof LEAVE_COUNT_TYPES] = LEAVE_COUNT_TYPES.TOTAL
): number | Array<{ x: string; y: number }> | Record<string, number> => {

  const globalStart = startDatem
    ? dayjs(startDatem)
    : dayjs(leaveAccrualStartDate(activeContract));

  const globalEnd = endDatem
    ? dayjs(endDatem)
    : dayjs(leaveAccrualEndDate(timeoffs));

  let totalLeaveCount: any = 0;
  if (timeoffs?.length && leaveType !== "Rotation") {
    totalLeaveCount = calculateLeaveWithAccruableCommon(
      timeoffs,
      activeContract,
      leaveType,
      false,
      globalStart,
      globalEnd,
      leaveCountType
    ) as number;
  }

  let rotationDays: any = 0;
  if (
    activeContract?.contractType === CONTRACT_TYPES.ROTATION &&
    (!leaveType || leaveType === "Rotation")
  ) {

    const rotationWorkingDays =
      workingDays && !Array.isArray(workingDays) ? workingDays : null;

    rotationDays = calculateRotationDays(
      1,
      globalStart,
      globalEnd,
      rotationWorkingDays,
      userId,
      "OffDuty",
      leaveCountType
    );
  }

  if (leaveCountType === LEAVE_COUNT_TYPES.TYPEWISE) {
    const rotationTotal = (totalLeaveCount.Rotation || 0) + rotationDays;

    return Object.keys(totalLeaveCount).length > 0
      ? {
        ...totalLeaveCount,
        ...(rotationTotal > 0 ? { Rotation: rotationTotal } : {})
      }
      : rotationTotal > 0
        ? { Rotation: rotationTotal }
        : {};
  }

  if (leaveCountType === LEAVE_COUNT_TYPES.MONTHLY) {
    const leaveMonthly = totalLeaveCount as unknown as Array<{ x: string; y: number }>;
    const rotationMonthly = rotationDays as unknown as Array<{ x: string; y: number }>;
    if (!leaveMonthly?.length || !rotationMonthly?.length) return Array.isArray(rotationMonthly) ? rotationMonthly : [];
    return leaveMonthly?.map((item, idx) => ({
      x: item.x,
      y: item.y + (rotationMonthly[idx]?.y || 0),
    }));
  }

  return typeof totalLeaveCount === "string" || typeof totalLeaveCount === "number" ? totalLeaveCount + rotationDays : totalLeaveCount || 0;
};

export const calculateLeaveNew = (
  paySlipHistory: PaySlipHistoryLike[] | null | undefined,
  timeoffs: TimeoffLike[] | null | undefined,
  activeContract: ContractLike | null | undefined,
  workingDays: WorkingDaysLike[] | { schedules?: ScheduleLike[] } | null | undefined,
  rotationWorkedDays: { schedules?: ScheduleLike[] } | null | undefined,
  userId: string | undefined,
  startDate: string | Date | undefined,
  endDate: string | Date | undefined,
  accrualSets: AccrualSetsLike | null | undefined
): number => {
  if (!activeContract) return 0;

  const contractLeave = activeContract?.leave || {};
  const { calculationMethod, leaveEntitlement } = contractLeave;

  const leaveAcStartDate = startDate
    ? dayjs(startDate)
    : leaveAccrualStartDate(activeContract);
  const leaveAcEndDate = endDate ? dayjs(endDate) : dayjs();

  if (!leaveAcStartDate) return 0;

  const getLeaveAccrual = getLeaveAccrualNew(
    calculationMethod,
    leaveEntitlement,
    leaveAcStartDate.format("YYYY-MM-DD"),
    leaveAcEndDate.format("YYYY-MM-DD"),
    activeContract?.contractType === CONTRACT_TYPES.ROTATION
      ? rotationWorkedDays
      : (workingDays as WorkingDaysLike[] | null | undefined),
    userId
  );

  const carriedOverResult = leaveCarriedOverFromPreviousYearFunction(activeContract);
  const carriedOverLeave =
    typeof carriedOverResult === "object" && carriedOverResult !== null
      ? carriedOverResult.leaveCarriedOver ?? 0
      : 0;

  const usedLeave = totalLeaveTakenFromHireDateNew(
    timeoffs,
    activeContract,
    leaveAcStartDate,
    leaveAcEndDate,
    activeContract?.contractType === CONTRACT_TYPES.ROTATION
      ? rotationWorkedDays
      : null,
    userId,
    undefined,
    LEAVE_COUNT_TYPES.TOTAL
  ) as number;

  const nonAccrualLeave = calculateNonAccruableLeave(
    timeoffs,
    activeContract,
    undefined,
    accrualSets
  );

  const payslipLeaveAdjustments = getPayslipLeaveAdjustments(
    paySlipHistory,
    activeContract
  );

  const totalLeave =
    +carriedOverLeave +
    getLeaveAccrual -
    usedLeave -
    nonAccrualLeave -
    payslipLeaveAdjustments;

  return allLeaveCalculationDecimalPlaces(totalLeave);
};

export const getLeaveAccrualMultipleContracts = (
  contracts: ContractLike[],
  workingDays: WorkingDaysLike[] | { schedules?: ScheduleLike[] } | null | undefined,
  startDate: string | Date | undefined,
  endDate: string | Date | undefined,
  userId: string | undefined,
  _timeoffs: unknown,
  filter = false
): number => {
  let filteredContracts = contracts;

  if (filter) {
    filteredContracts = getEffectiveContracts(
      contracts,
      startDate,
      endDate
    ) as ContractLike[];
  }

  const getFilterdContractWithStartDateAndEndDate = contracts.map(
    (contract, index) => {
      const dateRange = getSegmentDateRange(
        contract,
        index,
        contracts,
        [startDate, endDate],
        true
      );
      const range =
        typeof dateRange === "object"
          ? dateRange
          : { startDate: null, endDate: null };
      return {
        ...contract,
        startDateForSegmentCalculation: range?.startDate ?? null,
        endDateForSegmentCalculation: range?.endDate ?? null,
      };
    }
  );

  const finalData = getFilterdContractWithStartDateAndEndDate.reduce(
    (acc, contract) => {
      const leaveCalculationMethod = contract?.leave?.calculationMethod;
      const leaveEntitlement = contract?.leave?.leaveEntitlement;
      const totalLeave = getLeaveAccrualNew(
        leaveCalculationMethod,
        leaveEntitlement,
        contract?.startDateForSegmentCalculation ?? undefined,
        contract?.endDateForSegmentCalculation ?? undefined,
        workingDays,
        userId
      );
      return acc + totalLeave;
    },
    0
  );

  return allLeaveCalculationDecimalPlaces(finalData);
};

export const totalLeaveTakenMultipleContracts = (
  timeoffs: TimeoffLike[] | null | undefined,
  contracts: ContractLike[],
  workingDays: WorkingDaysLike[] | { schedules?: ScheduleLike[] } | null | undefined,
  rotationWorkedDays: { schedules?: ScheduleLike[] } | null | undefined,
  startDate: string | Date | undefined,
  endDate: string | Date | undefined,
  leaveType: string | undefined,
  userId: string | undefined,
  filter = false
): number => {
  let filteredContracts = contracts;
  if (filter) {
    filteredContracts = getEffectiveContracts(
      contracts,
      startDate,
      endDate
    ) as ContractLike[];
  }
  const finalContracts = getFilterdContractWithStartDateAndEndDate(
    filteredContracts,
    startDate,
    endDate
  );

  const totalLeave = finalContracts.reduce((acc, contract) => {
    const finalLeave = totalLeaveTakenFromHireDateNew(
      timeoffs,
      contract,
      contract?.startDateForSegmentCalculation,
      contract?.endDateForSegmentCalculation,
      contract?.contractType === CONTRACT_TYPES.ROTATION
        ? rotationWorkedDays
        : workingDays,
      userId,
      leaveType
    ) as number;
    return acc + finalLeave;
  }, 0);

  return allLeaveCalculationDecimalPlaces(totalLeave);
};

export { LEAVE_COUNT_TYPES, MONTHS_ARRAY, allLeaveCalculationDecimalPlaces } from "../contract/constant.js";
