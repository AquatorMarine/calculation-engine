import dayjs from "dayjs";
export const buildRotationScheduleGroups = (scheduleData) => {
    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return { scheduleGroups: [], latestGroupFirstScheduleId: null };
    }
    const scheduleGroups = [];
    let currentGroupId = scheduleData[0]?.scheduleGroupingId ?? null;
    let currentSchedules = [];
    for (let i = 0; i < scheduleData.length; i++) {
        const schedule = scheduleData[i];
        const groupId = schedule?.scheduleGroupingId ?? null;
        if (groupId !== currentGroupId) {
            scheduleGroups.push({
                scheduleGroupingId: currentGroupId,
                schedules: currentSchedules,
                isLatestGroup: scheduleGroups.length === 0,
            });
            currentGroupId = groupId;
            currentSchedules = [];
        }
        currentSchedules.push(schedule);
    }
    if (currentSchedules.length > 0) {
        scheduleGroups.push({
            scheduleGroupingId: currentGroupId,
            schedules: currentSchedules,
            isLatestGroup: scheduleGroups.length === 0,
        });
    }
    const latestGroupFirstScheduleId = scheduleGroups[0]?.schedules?.[0]?._id ?? null;
    return { scheduleGroups, latestGroupFirstScheduleId };
};
export const calculateRotationDutyDays = (schedules, todayInput) => {
    let onDutyDays = 0;
    let offDutyDays = 0;
    if (!Array.isArray(schedules) || schedules.length === 0) {
        return { onDutyDays, offDutyDays };
    }
    const today = todayInput
        ? dayjs(todayInput)
        : dayjs();
    if (!today.isValid()) {
        return { onDutyDays, offDutyDays };
    }
    const sortedSchedules = [...schedules].sort((a, b) => dayjs(b?.startDate).valueOf() -
        dayjs(a?.startDate).valueOf());
    const { scheduleGroups } = buildRotationScheduleGroups(sortedSchedules);
    for (const group of scheduleGroups) {
        const groupSchedules = group?.schedules ?? [];
        if (groupSchedules.length === 0)
            continue;
        if (groupSchedules.length === 1) {
            const onlySchedule = groupSchedules[0];
            const groupStart = dayjs(onlySchedule?.startDate);
            if (groupStart.isValid() && groupStart.isAfter(today))
                continue;
        }
        for (const schedule of groupSchedules) {
            const start = dayjs(schedule?.startDate);
            if (!start.isValid())
                continue;
            const end = schedule?.endDate
                ? dayjs(schedule.endDate)
                : today;
            if (!end.isValid())
                continue;
            const diffDays = end.diff(start, "day") + 1;
            if (diffDays <= 0)
                continue;
            if (schedule?.type === "OnDuty") {
                onDutyDays += diffDays;
            }
            else if (schedule?.type === "OffDuty") {
                offDutyDays += diffDays;
            }
        }
    }
    return { onDutyDays, offDutyDays };
};
