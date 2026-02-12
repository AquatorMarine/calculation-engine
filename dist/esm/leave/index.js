import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import minMax from "dayjs/plugin/minMax";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { LEAVE_CALCULATION_METHODS_CONSTANTS, CONTRACT_TYPES, CONTRACT_STATUS, MONTHS_ARRAY, LEAVE_COUNT_TYPES, EXCLUDED_LEAVE_TYPES, allLeaveCalculationDecimalPlaces, } from "../contract/constant.js";
dayjs.extend(isBetween);
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
const isEmpty = (arr) => !Array.isArray(arr) || arr.length === 0;
const defaultFormatDate = (d) => dayjs(d).format("YYYY-MM-DD");
export const isAbleToGenerateLeaveForSelectedDateRange = (payslips = [], leaveStartDate, leaveEndDate) => {
    if (isEmpty(payslips))
        return true;
    if (!leaveStartDate || !leaveEndDate)
        return false;
    const ls = dayjs(leaveStartDate);
    const le = dayjs(leaveEndDate);
    return !payslips.some((payslip) => {
        const psStart = dayjs(payslip.payslipStartDate);
        const psEnd = dayjs(payslip.payslipEndDate);
        if (!psStart.isValid() || !psEnd.isValid())
            return false;
        return ls.isSameOrBefore(psEnd, "day") && le.isSameOrAfter(psStart, "day");
    });
};
export const isThereAnyPendingLeaveBetweenSelectedPayslipDateRange = (timeoffs = [], startDate, endDate) => {
    if (isEmpty(timeoffs))
        return false;
    if (!startDate || !endDate)
        return false;
    const ls = dayjs(startDate);
    const le = dayjs(endDate);
    return timeoffs.some((timeoff) => {
        const toStart = dayjs(timeoff.startDate);
        const toEnd = dayjs(timeoff.endDate);
        if (!toStart.isValid() || !toEnd.isValid())
            return false;
        return (ls.isSameOrBefore(toEnd, "day") &&
            le.isSameOrAfter(toStart, "day") &&
            timeoff.status !== "Approved");
    });
};
export const deriveAccrualSets = (leaveSettings) => {
    if (!leaveSettings || !Array.isArray(leaveSettings))
        return null;
    const accruable = new Set();
    const nonAccruable = new Set();
    leaveSettings.forEach((s) => {
        if (!s || !s.leaveType)
            return;
        if (s.accruable)
            accruable.add(s.leaveType);
        else
            nonAccruable.add(s.leaveType);
    });
    return { accruable, nonAccruable };
};
export const getEffectiveContracts = (contracts, payslipStart, payslipEnd) => {
    if (!Array.isArray(contracts) || !payslipStart || !payslipEnd)
        return [];
    const pStart = dayjs(payslipStart);
    const pEnd = dayjs(payslipEnd);
    if (!pStart.isValid() || !pEnd.isValid() || pEnd.isBefore(pStart, "day"))
        return [];
    const effective = [];
    for (const contract of contracts) {
        if (contract.contractStatus === CONTRACT_STATUS.END)
            continue;
        const start = dayjs(contract.hiredAt);
        if (!start.isValid())
            continue;
        const end = contract.contractEndDateCalculated
            ? dayjs(contract.contractEndDateCalculated)
            : pEnd;
        if (!end.isValid())
            continue;
        if (end.isBefore(start, "day"))
            continue;
        if (start.isSameOrBefore(pEnd, "day") && end.isSameOrAfter(pStart, "day")) {
            effective.push({
                ...contract,
                effectiveFrom: dayjs.max(start, pStart).toISOString(),
                effectiveTo: dayjs.min(end, pEnd).toISOString(),
            });
        }
        if (start.isBefore(pStart, "day"))
            break;
    }
    return effective.reverse();
};
export const contractToConsiderForLeaveCalculation = (filteredContracts) => filteredContracts?.[filteredContracts?.length - 1];
export const finalEffectiveDateFromContracts = (seaContracts, dateRange) => {
    const effective = getEffectiveContracts(seaContracts, dateRange?.[0], dateRange?.[1]);
    const getActiveContract = contractToConsiderForLeaveCalculation(effective);
    return { effective, getActiveContract };
};
export const getSegmentDateRange = (contract, index, allContracts, payslipRange, dateReturn = false, formatDate = defaultFormatDate) => {
    const format = (d) => dateReturn ? d.toDate() : formatDate(d.toDate());
    const payslipStart = payslipRange?.[0] ? dayjs(payslipRange[0]) : null;
    const payslipEnd = payslipRange?.[1] ? dayjs(payslipRange[1]) : null;
    const hiredAt = contract?.hiredAt ? dayjs(contract.hiredAt) : null;
    const nextHiredAt = allContracts[index + 1]?.hiredAt
        ? dayjs(allContracts[index + 1].hiredAt)
        : null;
    let startDate = null;
    if (payslipStart && hiredAt) {
        startDate = payslipStart.isAfter(hiredAt, "day") ? payslipStart : hiredAt;
    }
    else {
        startDate = payslipStart || hiredAt;
    }
    let endDate = null;
    if (payslipEnd && nextHiredAt) {
        endDate = payslipEnd.isBefore(nextHiredAt, "day")
            ? payslipEnd
            : nextHiredAt.subtract(1, "day");
    }
    else {
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
export const getPayslipLeaveAdjustments = (paySlipHistory, activeContract) => {
    const filterPayslipHistory = paySlipHistory?.filter((payslip) => {
        return payslip.payoutObject?.contractId === activeContract?._id;
    });
    return (filterPayslipHistory?.reduce((acc, cur) => {
        return acc + (cur.payoutObject?.leavePayoutDays || 0);
    }, 0) || 0);
};
export const getActiveContractAtSpecificDate = (contracts, date) => {
    if (!Array.isArray(contracts) || !date)
        return null;
    const target = dayjs(date);
    if (!target.isValid())
        return null;
    const potentialContracts = contracts.filter((c) => {
        return (c.hiredAt &&
            dayjs(c.contractEffectiveDate || c.hiredAt).isSameOrBefore(target, "day"));
    });
    if (potentialContracts.length === 0)
        return null;
    const latestContract = potentialContracts.sort((a, b) => dayjs(b.contractEffectiveDate || b.hiredAt).valueOf() -
        dayjs(a.contractEffectiveDate || a.hiredAt).valueOf())[0];
    if (latestContract.contractExpiryDate) {
        const expiry = dayjs(latestContract.contractExpiryDate).endOf("day");
        if (target.isAfter(expiry, "day")) {
            return null;
        }
    }
    return latestContract;
};
export const getMaxWorkingDaysForMonth = (params) => {
    const { year, month, hiredAt, expiryAt } = params;
    if (!year || !month || !hiredAt)
        return 0;
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
    if (year < hireYear ||
        year > expiryYear ||
        (year === hireYear && month < hireMonth) ||
        (year === expiryYear && month > expiryMonth)) {
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
export const leaveCarriedOverFromPreviousYearFunction = (contract) => {
    if (!contract)
        return 0;
    const leaveCarriedOverFromPreviousYear = contract?.leaveCarryOverHistory;
    if (!leaveCarriedOverFromPreviousYear ||
        isEmpty(leaveCarriedOverFromPreviousYear))
        return 0;
    const lastLeaveCarriedOverFromPreviousYear = leaveCarriedOverFromPreviousYear[0];
    return lastLeaveCarriedOverFromPreviousYear;
};
export const getLeaveRenewalDateWithYear = (leaveRenewalDate, toDate = false, today = dayjs()) => {
    if (!leaveRenewalDate)
        return null;
    const renewalDate = dayjs(leaveRenewalDate);
    if (!renewalDate.isValid())
        return null;
    const renewalMonth = renewalDate.month();
    const renewalDay = renewalDate.date();
    const renewalThisYear = today.month(renewalMonth).date(renewalDay);
    const finalDate = today.isBefore(renewalThisYear, "day")
        ? renewalThisYear
        : renewalThisYear.add(1, "year");
    return toDate ? finalDate.toDate() : finalDate;
};
export const leaveAccrualStartDate = (activeContract) => {
    if (!activeContract)
        return null;
    const today = dayjs();
    const leaveRenewalDateRaw = activeContract.leave?.leaveRenewalDate;
    const contractEffectiveDate = activeContract.contractEffectiveDate
        ? dayjs(activeContract.contractEffectiveDate)
        : null;
    const hiredAt = dayjs(activeContract.hiredAt);
    const segmentStart = activeContract.startDateForSegmentCalculation
        ? dayjs(activeContract.startDateForSegmentCalculation)
        : null;
    const leaveRenewalDate = getLeaveRenewalDateWithYear(leaveRenewalDateRaw, false, today);
    const convertToDayJs = dayjs(leaveRenewalDate);
    const removeOneYearFromLeaveRenewalDate = convertToDayJs.subtract(1, "year");
    const compareDateWithHireDate = removeOneYearFromLeaveRenewalDate.isAfter(contractEffectiveDate || hiredAt, "day");
    const hiredDate = today.isBefore(leaveRenewalDate, "day")
        ? compareDateWithHireDate
            ? removeOneYearFromLeaveRenewalDate
            : contractEffectiveDate || hiredAt
        : leaveRenewalDate;
    let finalDate = dayjs(hiredDate);
    if (segmentStart) {
        finalDate = dayjs(hiredDate).isAfter(segmentStart, "day")
            ? dayjs(hiredDate)
            : segmentStart;
    }
    return finalDate;
};
export const leaveAccrualEndDate = (timeoffs) => {
    if (!timeoffs?.length)
        return null;
    let maxEndDate = null;
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
export const calculateWorkingDaysBetweenDatesForDaysWorked = (entitlement, startDate, endDate, workingDays = []) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (!workingDays?.length ||
        !start.isValid() ||
        !end.isValid() ||
        start.isAfter(end, "day")) {
        return 0;
    }
    const workingDaysMap = new Map(workingDays?.map((wd) => [wd.year, wd.workingDays || {}]));
    let totalWorkingDays = 0;
    const startYear = start.year();
    const endYear = end.year();
    const startMonth = start.month() + 1;
    const endMonth = end.month() + 1;
    const startDay = start.date();
    const endDay = end.date();
    for (let year = startYear; year <= endYear; year++) {
        const monthsData = workingDaysMap.get(year);
        if (!monthsData)
            continue;
        const mStart = year === startYear ? startMonth : 1;
        const mEnd = year === endYear ? endMonth : 12;
        for (let month = mStart; month <= mEnd; month++) {
            const monthlyMax = Number(monthsData[month] ?? 0);
            if (monthlyMax <= 0)
                continue;
            if (year === startYear &&
                year === endYear &&
                month === startMonth) {
                totalWorkingDays += Math.min(endDay - startDay + 1, monthlyMax);
            }
            else if (year === startYear && month === startMonth) {
                totalWorkingDays += Math.max(monthlyMax - (startDay - 1), 0);
            }
            else if (year === endYear && month === endMonth) {
                totalWorkingDays += Math.min(endDay, monthlyMax);
            }
            else {
                totalWorkingDays += monthlyMax;
            }
        }
    }
    const finalAccruedLeave = totalWorkingDays * entitlement;
    return finalAccruedLeave;
};
export const getFilterdContractWithStartDateAndEndDate = (contracts, startDate, endDate) => {
    return contracts.map((contract, index) => {
        const dateRange = getSegmentDateRange(contract, index, contracts, [startDate, endDate], true);
        const range = typeof dateRange === "object" ? dateRange : { startDate: null, endDate: null };
        return {
            ...contract,
            startDateForSegmentCalculation: range?.startDate ?? null,
            endDateForSegmentCalculation: range?.endDate ?? null,
        };
    });
};
export const calculateLeaveWithAccruableCommon = (timeoffs, activeContract, leaveType, nonAccruableLeaves = false, startDatem, endDatem, leaveCountType = LEAVE_COUNT_TYPES.TOTAL) => {
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
    const typeWiseCounts = {};
    let totalLeaveCount = 0;
    timeoffs?.forEach((leave) => {
        const isApproved = leave.status === "Approved";
        const isTargetType = !leaveType || leave.type === leaveType;
        const isExcluded = !leaveType && EXCLUDED_LEAVE_TYPES.includes(leave.type ?? "");
        const finalCheck = nonAccruableLeaves === false
            ? !isExcluded
            : nonAccruableLeaves?.has(leave.type ?? "") ?? false;
        if (isApproved && isTargetType && finalCheck) {
            let currentDay = dayjs(leave.startDate);
            const leaveEndDate = dayjs(leave.endDate);
            while (currentDay.isSameOrBefore(leaveEndDate, "day")) {
                const inWindow = currentDay.isBetween(globalStart, globalEnd, "day", "[]");
                if (inWindow) {
                    const isTravelDay = leave.travelDays?.some((travel) => {
                        const [tStart, tEnd] = travel.dateRange;
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
export const getDutyDays = (records, fromDate, toDate, type, excludeTravel = false, leaveCountType = LEAVE_COUNT_TYPES.TOTAL) => {
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
    const sortedRecords = records
        .slice()
        .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));
    const totalDutyDays = sortedRecords.reduce((total, rec, idx) => {
        if (rec.type !== type)
            return total;
        const rotationStart = dayjs(rec.startDate);
        let rotationEnd = rec.endDate
            ? dayjs(rec.endDate)
            : dayjs(); // use today if no endDate
        const nextRec = sortedRecords[idx + 1];
        if (nextRec &&
            nextRec.startDate &&
            rec.endDate &&
            dayjs(nextRec.startDate).isSame(rotationEnd, "day")) {
            rotationEnd = rotationEnd.subtract(1, "day");
        }
        const overlapStart = dayjs.max(rotationStart, start);
        const overlapEnd = dayjs.min(rotationEnd, end);
        if (overlapStart.isSameOrBefore(overlapEnd, "day")) {
            let currentDay = overlapStart;
            let diffDays = 0;
            const travelDaysArr = rec.travelDays;
            const firstPair = Array.isArray(travelDaysArr) && travelDaysArr.length > 0
                ? travelDaysArr[0]
                : undefined;
            const tStart = firstPair && Array.isArray(firstPair) && firstPair.length >= 2
                ? firstPair[0]
                : undefined;
            const tEnd = firstPair && Array.isArray(firstPair) && firstPair.length >= 2
                ? firstPair[1]
                : undefined;
            while (currentDay.isSameOrBefore(overlapEnd, "day")) {
                let isTravelDay = false;
                if (excludeTravel && tStart && tEnd) {
                    isTravelDay = currentDay.isBetween(dayjs(tStart), dayjs(tEnd), "day", "[]");
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
const calculateRotationDays = (entitlement, startDate, endDate, workingDays, userId, dutyType = "OnDuty", leaveCountType = LEAVE_COUNT_TYPES.TOTAL) => {
    const userSchedules = workingDays?.schedules?.filter((schedule) => schedule.userId === userId);
    if (!userSchedules?.length) {
        if (leaveCountType === LEAVE_COUNT_TYPES.MONTHLY) {
            return MONTHS_ARRAY.map((month) => ({ x: month, y: 0 }));
        }
        return 0;
    }
    const totalDays = getDutyDays(userSchedules, startDate, endDate, dutyType, true, leaveCountType);
    return Array.isArray(totalDays)
        ? totalDays.map((data) => ({
            x: data.x,
            y: allLeaveCalculationDecimalPlaces(Number(data.y) * Number(entitlement)),
        }))
        : Number(totalDays) * Number(entitlement);
};
export const getDailyAccruedLeaveNew = (method, enti, daysDiff = 1) => {
    if (!method || enti == null)
        return 0;
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
export const getLeaveAccrualNew = (method, entitlement, startDate, endDate, workingDays, userId) => {
    const endDateDayjs = dayjs(endDate ?? new Date());
    const startDateDayjs = dayjs(startDate);
    const daysDiff = endDateDayjs.diff(startDateDayjs, "day") + 1;
    let totalDays = 0;
    if (method === LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED) {
        totalDays = calculateWorkingDaysBetweenDatesForDaysWorked(entitlement ?? 0, startDate ?? "", endDate ?? "", Array.isArray(workingDays) ? workingDays : []);
        return totalDays;
    }
    else if (method ===
        LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION) {
        totalDays = calculateRotationDays(entitlement ?? 0, startDate ?? "", endDate ?? "", !Array.isArray(workingDays) ? workingDays : null, userId);
    }
    else if (method === LEAVE_CALCULATION_METHODS_CONSTANTS.LEAVE_ENTITLEMENT_LEAVE_TAKEN) {
        totalDays = entitlement ?? 0;
    }
    else {
        totalDays = getDailyAccruedLeaveNew(method, entitlement, daysDiff);
    }
    return totalDays;
};
export const calculateNonAccruableLeave = (timeoffs, activeContract, leaveType, accrualSets) => {
    const nonAccruableLeaves = accrualSets?.nonAccruable;
    const leaveCount = calculateLeaveWithAccruableCommon(timeoffs, activeContract, leaveType, nonAccruableLeaves ?? false, undefined, undefined, LEAVE_COUNT_TYPES.TOTAL);
    const totalLeaveToNonAccruable = leaveCount *
        getDailyAccruedLeaveNew(activeContract?.leave?.calculationMethod, activeContract?.leave?.leaveEntitlement);
    return totalLeaveToNonAccruable;
};
export const totalLeaveTakenFromHireDateNew = (timeoffs, activeContract, startDatem, endDatem, workingDays, userId, leaveType, leaveCountType = LEAVE_COUNT_TYPES.TOTAL) => {
    const globalStart = startDatem
        ? dayjs(startDatem)
        : dayjs(leaveAccrualStartDate(activeContract));
    const globalEnd = endDatem
        ? dayjs(endDatem)
        : dayjs(leaveAccrualEndDate(timeoffs));
    let totalLeaveCount = 0;
    if (timeoffs?.length) {
        totalLeaveCount = calculateLeaveWithAccruableCommon(timeoffs, activeContract, leaveType, false, globalStart, globalEnd, leaveCountType);
    }
    let rotationDays = 0;
    if (activeContract?.contractType === CONTRACT_TYPES.ROTATION &&
        !leaveType) {
        const rotationWorkingDays = workingDays && !Array.isArray(workingDays) ? workingDays : null;
        rotationDays = calculateRotationDays(1, globalStart, globalEnd, rotationWorkingDays, userId, "OffDuty", leaveCountType);
    }
    if (leaveCountType === LEAVE_COUNT_TYPES.MONTHLY) {
        const leaveMonthly = totalLeaveCount;
        const rotationMonthly = rotationDays;
        return leaveMonthly.map((item, idx) => ({
            x: item.x,
            y: item.y + (rotationMonthly[idx]?.y || 0),
        }));
    }
    return typeof totalLeaveCount === "string" || typeof totalLeaveCount === "number" ? totalLeaveCount + rotationDays : totalLeaveCount || 0;
};
export const calculateLeaveNew = (paySlipHistory, timeoffs, activeContract, workingDays, rotationWorkedDays, userId, startDate, endDate, accrualSets) => {
    if (!activeContract)
        return 0;
    const contractLeave = activeContract?.leave || {};
    const { calculationMethod, leaveEntitlement } = contractLeave;
    const leaveAcStartDate = startDate
        ? dayjs(startDate)
        : leaveAccrualStartDate(activeContract);
    const leaveAcEndDate = endDate ? dayjs(endDate) : dayjs();
    if (!leaveAcStartDate)
        return 0;
    const getLeaveAccrual = getLeaveAccrualNew(calculationMethod, leaveEntitlement, leaveAcStartDate.toISOString(), leaveAcEndDate.toISOString(), activeContract?.contractType === CONTRACT_TYPES.ROTATION
        ? rotationWorkedDays
        : workingDays, userId);
    const carriedOverResult = leaveCarriedOverFromPreviousYearFunction(activeContract);
    const carriedOverLeave = typeof carriedOverResult === "object" && carriedOverResult !== null
        ? carriedOverResult.leaveCarriedOver ?? 0
        : 0;
    const usedLeave = totalLeaveTakenFromHireDateNew(timeoffs, activeContract, leaveAcStartDate, leaveAcEndDate, activeContract?.contractType === CONTRACT_TYPES.ROTATION
        ? rotationWorkedDays
        : null, userId, undefined, LEAVE_COUNT_TYPES.TOTAL);
    const nonAccrualLeave = calculateNonAccruableLeave(timeoffs, activeContract, undefined, accrualSets);
    const payslipLeaveAdjustments = getPayslipLeaveAdjustments(paySlipHistory, activeContract);
    const totalLeave = +carriedOverLeave +
        getLeaveAccrual -
        usedLeave -
        nonAccrualLeave -
        payslipLeaveAdjustments;
    return allLeaveCalculationDecimalPlaces(totalLeave);
};
export const getLeaveAccrualMultipleContracts = (contracts, workingDays, startDate, endDate, userId, _timeoffs, filter = false) => {
    let filteredContracts = contracts;
    if (filter) {
        filteredContracts = getEffectiveContracts(contracts, startDate, endDate);
    }
    const getFilterdContractWithStartDateAndEndDate = contracts.map((contract, index) => {
        const dateRange = getSegmentDateRange(contract, index, contracts, [startDate, endDate], true);
        const range = typeof dateRange === "object"
            ? dateRange
            : { startDate: null, endDate: null };
        return {
            ...contract,
            startDateForSegmentCalculation: range?.startDate ?? null,
            endDateForSegmentCalculation: range?.endDate ?? null,
        };
    });
    const finalData = getFilterdContractWithStartDateAndEndDate.reduce((acc, contract) => {
        const leaveCalculationMethod = contract?.leave?.calculationMethod;
        const leaveEntitlement = contract?.leave?.leaveEntitlement;
        const totalLeave = getLeaveAccrualNew(leaveCalculationMethod, leaveEntitlement, contract?.startDateForSegmentCalculation ?? undefined, contract?.endDateForSegmentCalculation ?? undefined, workingDays, userId);
        return acc + totalLeave;
    }, 0);
    return allLeaveCalculationDecimalPlaces(finalData);
};
export const totalLeaveTakenMultipleContracts = (timeoffs, contracts, workingDays, rotationWorkedDays, startDate, endDate, leaveType, userId, filter = false) => {
    let filteredContracts = contracts;
    if (filter) {
        filteredContracts = getEffectiveContracts(contracts, startDate, endDate);
    }
    const finalContracts = getFilterdContractWithStartDateAndEndDate(filteredContracts, startDate, endDate);
    const totalLeave = finalContracts.reduce((acc, contract) => {
        const finalLeave = totalLeaveTakenFromHireDateNew(timeoffs, contract, contract?.startDateForSegmentCalculation, contract?.endDateForSegmentCalculation, contract?.contractType === CONTRACT_TYPES.ROTATION
            ? rotationWorkedDays
            : workingDays, userId, leaveType);
        return acc + finalLeave;
    }, 0);
    return allLeaveCalculationDecimalPlaces(totalLeave);
};
export { LEAVE_COUNT_TYPES, MONTHS_ARRAY, allLeaveCalculationDecimalPlaces } from "../contract/constant.js";
