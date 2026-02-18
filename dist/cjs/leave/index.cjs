"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allLeaveCalculationDecimalPlaces = exports.MONTHS_ARRAY = exports.LEAVE_COUNT_TYPES = exports.totalLeaveTakenMultipleContracts = exports.getLeaveAccrualMultipleContracts = exports.calculateLeaveNew = exports.totalLeaveTakenFromHireDateNew = exports.calculateNonAccruableLeave = exports.getLeaveAccrualNew = exports.getDailyAccruedLeaveNew = exports.calculateRotationDays = exports.getDutyDays = exports.getAllTravelDays = exports.calculateLeaveWithAccruableCommon = exports.getFilterdContractWithStartDateAndEndDate = exports.calculateWorkingDaysBetweenDatesForDaysWorked = exports.leaveAccrualEndDate = exports.leaveAccrualStartDate = exports.getLeaveRenewalDateWithYear = exports.leaveCarriedOverFromPreviousYearFunction = exports.getMaxWorkingDaysForMonth = exports.getActiveContractAtSpecificDate = exports.getPayslipLeaveAdjustments = exports.getSegmentDateRange = exports.finalEffectiveDateFromContracts = exports.contractToConsiderForLeaveCalculation = exports.getEffectiveContracts = exports.deriveAccrualSets = exports.isThereAnyPendingLeaveBetweenSelectedPayslipDateRange = exports.isAbleToGenerateLeaveForSelectedDateRange = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const isBetween_1 = __importDefault(require("dayjs/plugin/isBetween"));
const minMax_1 = __importDefault(require("dayjs/plugin/minMax"));
const isSameOrBefore_1 = __importDefault(require("dayjs/plugin/isSameOrBefore"));
const isSameOrAfter_1 = __importDefault(require("dayjs/plugin/isSameOrAfter"));
const constant_js_1 = require("../contract/constant.cjs");
dayjs_1.default.extend(isBetween_1.default);
dayjs_1.default.extend(minMax_1.default);
dayjs_1.default.extend(isSameOrBefore_1.default);
dayjs_1.default.extend(isSameOrAfter_1.default);
const isEmpty = (arr) => !Array.isArray(arr) || arr.length === 0;
const defaultFormatDate = (d) => (0, dayjs_1.default)(d).format("YYYY-MM-DD");
const isAbleToGenerateLeaveForSelectedDateRange = (payslips = [], leaveStartDate, leaveEndDate) => {
    if (isEmpty(payslips))
        return true;
    if (!leaveStartDate || !leaveEndDate)
        return false;
    const ls = (0, dayjs_1.default)(leaveStartDate);
    const le = (0, dayjs_1.default)(leaveEndDate);
    return !payslips.some((payslip) => {
        const psStart = (0, dayjs_1.default)(payslip.payslipStartDate);
        const psEnd = (0, dayjs_1.default)(payslip.payslipEndDate);
        if (!psStart.isValid() || !psEnd.isValid())
            return false;
        return ls.isSameOrBefore(psEnd, "day") && le.isSameOrAfter(psStart, "day");
    });
};
exports.isAbleToGenerateLeaveForSelectedDateRange = isAbleToGenerateLeaveForSelectedDateRange;
const isThereAnyPendingLeaveBetweenSelectedPayslipDateRange = (timeoffs = [], startDate, endDate) => {
    if (isEmpty(timeoffs))
        return false;
    if (!startDate || !endDate)
        return false;
    const ls = (0, dayjs_1.default)(startDate);
    const le = (0, dayjs_1.default)(endDate);
    return timeoffs.some((timeoff) => {
        const toStart = (0, dayjs_1.default)(timeoff.startDate);
        const toEnd = (0, dayjs_1.default)(timeoff.endDate);
        if (!toStart.isValid() || !toEnd.isValid())
            return false;
        return (ls.isSameOrBefore(toEnd, "day") &&
            le.isSameOrAfter(toStart, "day") &&
            timeoff.status !== "Approved");
    });
};
exports.isThereAnyPendingLeaveBetweenSelectedPayslipDateRange = isThereAnyPendingLeaveBetweenSelectedPayslipDateRange;
const deriveAccrualSets = (leaveSettings) => {
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
exports.deriveAccrualSets = deriveAccrualSets;
const getEffectiveContracts = (contracts, payslipStart, payslipEnd) => {
    if (!Array.isArray(contracts) || !payslipStart || !payslipEnd)
        return [];
    const pStart = (0, dayjs_1.default)(payslipStart);
    const pEnd = (0, dayjs_1.default)(payslipEnd);
    if (!pStart.isValid() || !pEnd.isValid() || pEnd.isBefore(pStart, "day"))
        return [];
    const effective = [];
    for (const contract of contracts) {
        if (contract.contractStatus === constant_js_1.CONTRACT_STATUS.END)
            continue;
        const start = (0, dayjs_1.default)(contract.hiredAt);
        if (!start.isValid())
            continue;
        const end = contract.contractEndDateCalculated
            ? (0, dayjs_1.default)(contract.contractEndDateCalculated)
            : pEnd;
        if (!end.isValid())
            continue;
        if (end.isBefore(start, "day"))
            continue;
        if (start.isSameOrBefore(pEnd, "day") && end.isSameOrAfter(pStart, "day")) {
            effective.push({
                ...contract,
                effectiveFrom: dayjs_1.default.max(start, pStart).toISOString(),
                effectiveTo: dayjs_1.default.min(end, pEnd).toISOString(),
            });
        }
        if (start.isBefore(pStart, "day"))
            break;
    }
    return effective.reverse();
};
exports.getEffectiveContracts = getEffectiveContracts;
const contractToConsiderForLeaveCalculation = (filteredContracts) => filteredContracts?.[filteredContracts?.length - 1];
exports.contractToConsiderForLeaveCalculation = contractToConsiderForLeaveCalculation;
const finalEffectiveDateFromContracts = (seaContracts, dateRange) => {
    const effective = (0, exports.getEffectiveContracts)(seaContracts, dateRange?.[0], dateRange?.[1]);
    const getActiveContract = (0, exports.contractToConsiderForLeaveCalculation)(effective);
    return { effective, getActiveContract };
};
exports.finalEffectiveDateFromContracts = finalEffectiveDateFromContracts;
const getSegmentDateRange = (contract, index, allContracts, payslipRange, dateReturn = false, formatDate = defaultFormatDate) => {
    const format = (d) => dateReturn ? d.format("YYYY-MM-DD") : formatDate(d.toDate());
    const payslipStart = payslipRange?.[0] ? (0, dayjs_1.default)(payslipRange[0]) : null;
    const payslipEnd = payslipRange?.[1] ? (0, dayjs_1.default)(payslipRange[1]) : null;
    const hiredAt = contract?.hiredAt ? (0, dayjs_1.default)(contract.hiredAt) : null;
    const nextHiredAt = allContracts[index + 1]?.hiredAt
        ? (0, dayjs_1.default)(allContracts[index + 1].hiredAt)
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
exports.getSegmentDateRange = getSegmentDateRange;
const getPayslipLeaveAdjustments = (paySlipHistory, activeContract) => {
    const filterPayslipHistory = paySlipHistory?.filter((payslip) => {
        return payslip.payoutObject?.contractId === activeContract?._id;
    });
    return (filterPayslipHistory?.reduce((acc, cur) => {
        return acc + (cur.payoutObject?.leavePayoutDays || 0);
    }, 0) || 0);
};
exports.getPayslipLeaveAdjustments = getPayslipLeaveAdjustments;
const getActiveContractAtSpecificDate = (contracts, date) => {
    if (!Array.isArray(contracts) || !date)
        return null;
    const target = (0, dayjs_1.default)(date);
    if (!target.isValid())
        return null;
    const potentialContracts = contracts.filter((c) => {
        return (c.hiredAt &&
            (0, dayjs_1.default)(c.contractEffectiveDate || c.hiredAt).isSameOrBefore(target, "day"));
    });
    if (potentialContracts.length === 0)
        return null;
    const latestContract = potentialContracts.sort((a, b) => (0, dayjs_1.default)(b.contractEffectiveDate || b.hiredAt).valueOf() -
        (0, dayjs_1.default)(a.contractEffectiveDate || a.hiredAt).valueOf())[0];
    if (latestContract.contractExpiryDate) {
        const expiry = (0, dayjs_1.default)(latestContract.contractExpiryDate).endOf("day");
        if (target.isAfter(expiry, "day")) {
            return null;
        }
    }
    return latestContract;
};
exports.getActiveContractAtSpecificDate = getActiveContractAtSpecificDate;
const getMaxWorkingDaysForMonth = (params) => {
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
exports.getMaxWorkingDaysForMonth = getMaxWorkingDaysForMonth;
const leaveCarriedOverFromPreviousYearFunction = (contract) => {
    if (!contract)
        return 0;
    const leaveCarriedOverFromPreviousYear = contract?.leaveCarryOverHistory;
    if (!leaveCarriedOverFromPreviousYear ||
        isEmpty(leaveCarriedOverFromPreviousYear))
        return 0;
    const lastLeaveCarriedOverFromPreviousYear = leaveCarriedOverFromPreviousYear[0];
    return lastLeaveCarriedOverFromPreviousYear;
};
exports.leaveCarriedOverFromPreviousYearFunction = leaveCarriedOverFromPreviousYearFunction;
const getLeaveRenewalDateWithYear = (leaveRenewalDate, toDate = false, today = (0, dayjs_1.default)()) => {
    if (!leaveRenewalDate)
        return null;
    const renewalDate = (0, dayjs_1.default)(leaveRenewalDate);
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
exports.getLeaveRenewalDateWithYear = getLeaveRenewalDateWithYear;
const leaveAccrualStartDate = (activeContract) => {
    if (!activeContract)
        return null;
    const today = (0, dayjs_1.default)();
    const leaveRenewalDateRaw = activeContract.leave?.leaveRenewalDate;
    const contractEffectiveDate = activeContract.contractEffectiveDate
        ? (0, dayjs_1.default)(activeContract.contractEffectiveDate)
        : null;
    const hiredAt = (0, dayjs_1.default)(activeContract.hiredAt);
    const segmentStart = activeContract.startDateForSegmentCalculation
        ? (0, dayjs_1.default)(activeContract.startDateForSegmentCalculation)
        : null;
    const leaveRenewalDate = (0, exports.getLeaveRenewalDateWithYear)(leaveRenewalDateRaw, false, today);
    const convertToDayJs = (0, dayjs_1.default)(leaveRenewalDate);
    const removeOneYearFromLeaveRenewalDate = convertToDayJs.subtract(1, "year");
    const compareDateWithHireDate = removeOneYearFromLeaveRenewalDate.isAfter(contractEffectiveDate || hiredAt, "day");
    const hiredDate = today.isBefore(leaveRenewalDate, "day")
        ? compareDateWithHireDate
            ? removeOneYearFromLeaveRenewalDate
            : contractEffectiveDate || hiredAt
        : leaveRenewalDate;
    let finalDate = (0, dayjs_1.default)(hiredDate);
    if (segmentStart) {
        finalDate = (0, dayjs_1.default)(hiredDate).isAfter(segmentStart, "day")
            ? (0, dayjs_1.default)(hiredDate)
            : segmentStart;
    }
    return finalDate;
};
exports.leaveAccrualStartDate = leaveAccrualStartDate;
const leaveAccrualEndDate = (timeoffs) => {
    if (!timeoffs?.length)
        return (0, dayjs_1.default)().toDate();
    let maxEndDate = null;
    for (const timeoff of timeoffs) {
        if (timeoff?.endDate) {
            const current = (0, dayjs_1.default)(timeoff.endDate);
            if (!maxEndDate || current.isAfter(maxEndDate, "day")) {
                maxEndDate = current;
            }
        }
    }
    const currentEndDate = (0, dayjs_1.default)();
    return maxEndDate
        ? currentEndDate.isAfter(maxEndDate, "day")
            ? currentEndDate.toDate()
            : maxEndDate.toDate()
        : null;
};
exports.leaveAccrualEndDate = leaveAccrualEndDate;
const calculateWorkingDaysBetweenDatesForDaysWorked = (entitlement, startDate, endDate, workingDays = []) => {
    const start = (0, dayjs_1.default)(startDate);
    const end = (0, dayjs_1.default)(endDate);
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
exports.calculateWorkingDaysBetweenDatesForDaysWorked = calculateWorkingDaysBetweenDatesForDaysWorked;
const getFilterdContractWithStartDateAndEndDate = (contracts, startDate, endDate) => {
    return contracts.map((contract, index) => {
        const dateRange = (0, exports.getSegmentDateRange)(contract, index, contracts, [startDate, endDate], true);
        const range = typeof dateRange === "object" ? dateRange : { startDate: null, endDate: null };
        return {
            ...contract,
            startDateForSegmentCalculation: range?.startDate ?? null,
            endDateForSegmentCalculation: range?.endDate ?? null,
        };
    });
};
exports.getFilterdContractWithStartDateAndEndDate = getFilterdContractWithStartDateAndEndDate;
const calculateLeaveWithAccruableCommon = (timeoffs, activeContract, leaveType, nonAccruableLeaves = false, startDatem, endDatem, leaveCountType = constant_js_1.LEAVE_COUNT_TYPES.TOTAL) => {
    const globalStart = startDatem
        ? (0, dayjs_1.default)(startDatem)
        : (0, dayjs_1.default)((0, exports.leaveAccrualStartDate)(activeContract));
    const globalEnd = endDatem
        ? (0, dayjs_1.default)(endDatem)
        : (0, dayjs_1.default)((0, exports.leaveAccrualEndDate)(timeoffs));
    const monthWiseCounts = constant_js_1.MONTHS_ARRAY.map((month) => ({
        x: month,
        y: 0,
    }));
    const typeWiseCounts = {};
    let totalLeaveCount = 0;
    timeoffs?.forEach((leave) => {
        const isApproved = leave.status === "Approved";
        const isTargetType = !leaveType || leave.type === leaveType;
        const isExcluded = !leaveType && constant_js_1.EXCLUDED_LEAVE_TYPES.includes(leave.type ?? "");
        const finalCheck = nonAccruableLeaves === false
            ? !isExcluded
            : nonAccruableLeaves?.has(leave.type ?? "") ?? false;
        if (isApproved && isTargetType && finalCheck) {
            let currentDay = (0, dayjs_1.default)(leave.startDate);
            const leaveEndDate = (0, dayjs_1.default)(leave.endDate);
            while (currentDay.isSameOrBefore(leaveEndDate, "day")) {
                const inWindow = currentDay.isBetween(globalStart, globalEnd, "day", "[]");
                if (inWindow) {
                    const isTravelDay = leave.travelDays?.some((travel) => {
                        if (!travel?.dateRange?.length)
                            return false;
                        const [tStart, tEnd] = travel?.dateRange ?? [];
                        return currentDay.isBetween((0, dayjs_1.default)(tStart), (0, dayjs_1.default)(tEnd), "day", "[]");
                    });
                    if (!isTravelDay) {
                        totalLeaveCount++;
                        if (leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.MONTHLY) {
                            const monthIndex = currentDay.month();
                            monthWiseCounts[monthIndex].y++;
                        }
                        if (leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.TYPEWISE) {
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
    if (leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.TYPEWISE) {
        return typeWiseCounts;
    }
    if (leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.MONTHLY) {
        return monthWiseCounts;
    }
    return totalLeaveCount;
};
exports.calculateLeaveWithAccruableCommon = calculateLeaveWithAccruableCommon;
const getAllTravelDays = (data) => {
    const result = [];
    data.forEach((item) => {
        if (!item.travelDays || !Array.isArray(item.travelDays))
            return;
        const [start, end] = item.travelDays;
        if (!start || !end)
            return;
        let current = (0, dayjs_1.default)(start);
        const last = (0, dayjs_1.default)(end);
        while (current.isSameOrBefore(last, "day")) {
            result.push(current.format("YYYY-MM-DD"));
            current = current.add(1, "day");
        }
    });
    // remove duplicates + sort
    return [...new Set(result)].sort();
};
exports.getAllTravelDays = getAllTravelDays;
function adjustEndDates(contracts) {
    // Sort by startDate to ensure correct order
    contracts.sort((a, b) => (0, dayjs_1.default)(a.startDate).valueOf() - (0, dayjs_1.default)(b.startDate).valueOf());
    for (let i = 0; i < contracts.length - 1; i++) {
        const current = contracts[i];
        const next = contracts[i + 1];
        if (!current.endDate || !next.startDate)
            continue;
        const currentEnd = (0, dayjs_1.default)(current.endDate);
        const nextStart = (0, dayjs_1.default)(next.startDate);
        // If current end equals next start
        if (currentEnd.isSame(nextStart, "day")) {
            current.endDate = currentEnd.subtract(1, "day").format("YYYY-MM-DD");
        }
    }
    return contracts;
}
const getDutyDays = (records, fromDate, toDate, type, excludeTravel = false, leaveCountType = constant_js_1.LEAVE_COUNT_TYPES.TOTAL) => {
    const start = (0, dayjs_1.default)(fromDate);
    const end = (0, dayjs_1.default)(toDate);
    const monthWiseCounts = constant_js_1.MONTHS_ARRAY.map((month) => ({
        x: month,
        y: 0,
    }));
    if (!Array.isArray(records) || records.length === 0) {
        return leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.MONTHLY
            ? monthWiseCounts
            : 0;
    }
    const record = records
        .slice()
        .sort((a, b) => (0, dayjs_1.default)(a.startDate).diff((0, dayjs_1.default)(b.startDate)));
    const sortedRecords = adjustEndDates(record);
    const travelDays = (0, exports.getAllTravelDays)(sortedRecords);
    const totalDutyDays = sortedRecords.reduce((total, rec, idx) => {
        if (rec.type !== type)
            return total;
        const rotationStart = (0, dayjs_1.default)(rec.startDate);
        let rotationEnd = rec.endDate
            ? (0, dayjs_1.default)(rec.endDate)
            : end; // use today if no endDate
        const overlapStart = dayjs_1.default.max(rotationStart, start);
        const overlapEnd = dayjs_1.default.min(rotationEnd, end);
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
                    if (leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.MONTHLY) {
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
    if (leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.MONTHLY) {
        return monthWiseCounts;
    }
    return totalDutyDays;
};
exports.getDutyDays = getDutyDays;
const calculateRotationDays = (entitlement, startDate, endDate, workingDays, userId, dutyType = "OnDuty", leaveCountType = constant_js_1.LEAVE_COUNT_TYPES.TOTAL) => {
    const userSchedules = workingDays?.schedules?.filter((schedule) => schedule.userId === userId);
    if (!userSchedules?.length) {
        if (leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.MONTHLY) {
            return constant_js_1.MONTHS_ARRAY.map((month) => ({ x: month, y: 0 }));
        }
        return 0;
    }
    const totalDays = (0, exports.getDutyDays)(userSchedules, startDate, endDate, dutyType, true, leaveCountType);
    return Array.isArray(totalDays)
        ? totalDays.map((data) => ({
            x: data.x,
            y: (0, constant_js_1.allLeaveCalculationDecimalPlaces)(Number(data.y) * Number(entitlement)),
        }))
        : Number(totalDays) * Number(entitlement);
};
exports.calculateRotationDays = calculateRotationDays;
const getDailyAccruedLeaveNew = (method, enti, daysDiff = 1) => {
    if (!method || enti == null)
        return 0;
    let dailyLeave = 0;
    const entitlement = Number(enti);
    switch (method) {
        case constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_PER_YEAR_365:
            dailyLeave =
                (0, constant_js_1.allLeaveCalculationDecimalPlaces)(entitlement / 365) * daysDiff;
            break;
        case constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.LEAVE_ENTITLEMENT_LEAVE_TAKEN:
            dailyLeave = 0;
            break;
        case constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_30DAYS:
            dailyLeave = (0, constant_js_1.allLeaveCalculationDecimalPlaces)(entitlement / 30) * daysDiff;
            break;
        case constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_31DAYS:
            dailyLeave = (0, constant_js_1.allLeaveCalculationDecimalPlaces)(entitlement / 31) * daysDiff;
            break;
        case constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_12_365DAYS:
            dailyLeave =
                (0, constant_js_1.allLeaveCalculationDecimalPlaces)((entitlement * 12) / 365) * daysDiff;
            break;
        case constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED:
            dailyLeave = +entitlement;
            break;
        case constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION:
            dailyLeave = +entitlement;
            break;
        default:
            return 0;
    }
    return (0, constant_js_1.allLeaveCalculationDecimalPlaces)(dailyLeave);
};
exports.getDailyAccruedLeaveNew = getDailyAccruedLeaveNew;
const getLeaveAccrualNew = (method, entitlement, startDate, endDate, workingDays, userId) => {
    const endDateDayjs = (0, dayjs_1.default)(endDate ?? new Date());
    const startDateDayjs = (0, dayjs_1.default)(startDate);
    const daysDiff = endDateDayjs.diff(startDateDayjs, "day") + 1;
    let totalDays = 0;
    if (method === constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED) {
        totalDays = (0, exports.calculateWorkingDaysBetweenDatesForDaysWorked)(entitlement ?? 0, startDate ?? "", endDate ?? "", Array.isArray(workingDays) ? workingDays : []);
        return totalDays;
    }
    else if (method ===
        constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.DAYS_ACCRUED_DAYS_WORKED_BASED_ON_ROTATION) {
        totalDays = (0, exports.calculateRotationDays)(entitlement ?? 0, startDate ?? "", endDate ?? "", !Array.isArray(workingDays) ? workingDays : null, userId);
    }
    else if (method === constant_js_1.LEAVE_CALCULATION_METHODS_CONSTANTS.LEAVE_ENTITLEMENT_LEAVE_TAKEN) {
        totalDays = entitlement ?? 0;
    }
    else {
        totalDays = (0, exports.getDailyAccruedLeaveNew)(method, entitlement, daysDiff);
    }
    return totalDays;
};
exports.getLeaveAccrualNew = getLeaveAccrualNew;
const calculateNonAccruableLeave = (timeoffs, activeContract, leaveType, accrualSets) => {
    const nonAccruableLeaves = accrualSets?.nonAccruable;
    const leaveCount = (0, exports.calculateLeaveWithAccruableCommon)(timeoffs, activeContract, leaveType, nonAccruableLeaves ?? false, undefined, undefined, constant_js_1.LEAVE_COUNT_TYPES.TOTAL);
    const totalLeaveToNonAccruable = leaveCount *
        (0, exports.getDailyAccruedLeaveNew)(activeContract?.leave?.calculationMethod, activeContract?.leave?.leaveEntitlement);
    return totalLeaveToNonAccruable;
};
exports.calculateNonAccruableLeave = calculateNonAccruableLeave;
const totalLeaveTakenFromHireDateNew = (timeoffs, activeContract, startDatem, endDatem, workingDays, userId, leaveType, leaveCountType = constant_js_1.LEAVE_COUNT_TYPES.TOTAL) => {
    const globalStart = startDatem
        ? (0, dayjs_1.default)(startDatem)
        : (0, dayjs_1.default)((0, exports.leaveAccrualStartDate)(activeContract));
    const globalEnd = endDatem
        ? (0, dayjs_1.default)(endDatem)
        : (0, dayjs_1.default)((0, exports.leaveAccrualEndDate)(timeoffs));
    let totalLeaveCount = 0;
    if (timeoffs?.length && leaveType !== "Rotation") {
        totalLeaveCount = (0, exports.calculateLeaveWithAccruableCommon)(timeoffs, activeContract, leaveType, false, globalStart, globalEnd, leaveCountType);
    }
    let rotationDays = 0;
    if (activeContract?.contractType === constant_js_1.CONTRACT_TYPES.ROTATION &&
        (!leaveType || leaveType === "Rotation")) {
        const rotationWorkingDays = workingDays && !Array.isArray(workingDays) ? workingDays : null;
        rotationDays = (0, exports.calculateRotationDays)(1, globalStart, globalEnd, rotationWorkingDays, userId, "OffDuty", leaveCountType);
    }
    if (leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.TYPEWISE) {
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
    if (leaveCountType === constant_js_1.LEAVE_COUNT_TYPES.MONTHLY) {
        const leaveMonthly = totalLeaveCount;
        const rotationMonthly = rotationDays;
        if (!leaveMonthly?.length || !rotationMonthly?.length)
            return Array.isArray(rotationMonthly) ? rotationMonthly : [];
        return leaveMonthly?.map((item, idx) => ({
            x: item.x,
            y: item.y + (rotationMonthly[idx]?.y || 0),
        }));
    }
    return typeof totalLeaveCount === "string" || typeof totalLeaveCount === "number" ? totalLeaveCount + rotationDays : totalLeaveCount || 0;
};
exports.totalLeaveTakenFromHireDateNew = totalLeaveTakenFromHireDateNew;
const calculateLeaveNew = (paySlipHistory, timeoffs, activeContract, workingDays, rotationWorkedDays, userId, startDate, endDate, accrualSets) => {
    if (!activeContract)
        return 0;
    const contractLeave = activeContract?.leave || {};
    const { calculationMethod, leaveEntitlement } = contractLeave;
    const leaveAcStartDate = startDate
        ? (0, dayjs_1.default)(startDate)
        : (0, exports.leaveAccrualStartDate)(activeContract);
    const leaveAcEndDate = endDate ? (0, dayjs_1.default)(endDate) : (0, dayjs_1.default)();
    if (!leaveAcStartDate)
        return 0;
    const getLeaveAccrual = (0, exports.getLeaveAccrualNew)(calculationMethod, leaveEntitlement, leaveAcStartDate.format("YYYY-MM-DD"), leaveAcEndDate.format("YYYY-MM-DD"), activeContract?.contractType === constant_js_1.CONTRACT_TYPES.ROTATION
        ? rotationWorkedDays
        : workingDays, userId);
    const carriedOverResult = (0, exports.leaveCarriedOverFromPreviousYearFunction)(activeContract);
    const carriedOverLeave = typeof carriedOverResult === "object" && carriedOverResult !== null
        ? carriedOverResult.leaveCarriedOver ?? 0
        : 0;
    const usedLeave = (0, exports.totalLeaveTakenFromHireDateNew)(timeoffs, activeContract, leaveAcStartDate, endDate ? leaveAcEndDate : undefined, activeContract?.contractType === constant_js_1.CONTRACT_TYPES.ROTATION
        ? rotationWorkedDays
        : null, userId, undefined, constant_js_1.LEAVE_COUNT_TYPES.TOTAL);
    const nonAccrualLeave = (0, exports.calculateNonAccruableLeave)(timeoffs, activeContract, undefined, accrualSets);
    const payslipLeaveAdjustments = (0, exports.getPayslipLeaveAdjustments)(paySlipHistory, activeContract);
    const totalLeave = +carriedOverLeave +
        getLeaveAccrual -
        usedLeave -
        nonAccrualLeave -
        payslipLeaveAdjustments;
    return (0, constant_js_1.allLeaveCalculationDecimalPlaces)(totalLeave);
};
exports.calculateLeaveNew = calculateLeaveNew;
const getLeaveAccrualMultipleContracts = (contracts, workingDays, startDate, endDate, userId, _timeoffs, filter = false) => {
    let filteredContracts = contracts;
    if (filter) {
        filteredContracts = (0, exports.getEffectiveContracts)(contracts, startDate, endDate);
    }
    const getFilterdContractWithStartDateAndEndDate = contracts.map((contract, index) => {
        const dateRange = (0, exports.getSegmentDateRange)(contract, index, contracts, [startDate, endDate], true);
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
        const totalLeave = (0, exports.getLeaveAccrualNew)(leaveCalculationMethod, leaveEntitlement, contract?.startDateForSegmentCalculation ?? undefined, contract?.endDateForSegmentCalculation ?? undefined, workingDays, userId);
        return acc + totalLeave;
    }, 0);
    return (0, constant_js_1.allLeaveCalculationDecimalPlaces)(finalData);
};
exports.getLeaveAccrualMultipleContracts = getLeaveAccrualMultipleContracts;
const totalLeaveTakenMultipleContracts = (timeoffs, contracts, workingDays, rotationWorkedDays, startDate, endDate, leaveType, userId, filter = false) => {
    let filteredContracts = contracts;
    if (filter) {
        filteredContracts = (0, exports.getEffectiveContracts)(contracts, startDate, endDate);
    }
    const finalContracts = (0, exports.getFilterdContractWithStartDateAndEndDate)(filteredContracts, startDate, endDate);
    const totalLeave = finalContracts.reduce((acc, contract) => {
        const finalLeave = (0, exports.totalLeaveTakenFromHireDateNew)(timeoffs, contract, contract?.startDateForSegmentCalculation, contract?.endDateForSegmentCalculation, contract?.contractType === constant_js_1.CONTRACT_TYPES.ROTATION
            ? rotationWorkedDays
            : workingDays, userId, leaveType);
        return acc + finalLeave;
    }, 0);
    return (0, constant_js_1.allLeaveCalculationDecimalPlaces)(totalLeave);
};
exports.totalLeaveTakenMultipleContracts = totalLeaveTakenMultipleContracts;
var constant_js_2 = require("../contract/constant.cjs");
Object.defineProperty(exports, "LEAVE_COUNT_TYPES", { enumerable: true, get: function () { return constant_js_2.LEAVE_COUNT_TYPES; } });
Object.defineProperty(exports, "MONTHS_ARRAY", { enumerable: true, get: function () { return constant_js_2.MONTHS_ARRAY; } });
Object.defineProperty(exports, "allLeaveCalculationDecimalPlaces", { enumerable: true, get: function () { return constant_js_2.allLeaveCalculationDecimalPlaces; } });
