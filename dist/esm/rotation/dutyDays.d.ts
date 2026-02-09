export type RotationScheduleLike = {
    _id?: string;
    startDate?: string;
    endDate?: string | null;
    type?: string;
    scheduleGroupingId?: string | null;
    [key: string]: any;
};
export type RotationScheduleGroup = {
    scheduleGroupingId: string | null;
    schedules: RotationScheduleLike[];
    isLatestGroup: boolean;
};
export type RotationScheduleGroupsResult = {
    scheduleGroups: RotationScheduleGroup[];
    latestGroupFirstScheduleId: string | null;
};
export declare const buildRotationScheduleGroups: (scheduleData?: RotationScheduleLike[] | null) => RotationScheduleGroupsResult;
export declare const calculateRotationDutyDays: (schedules?: RotationScheduleLike[] | null, todayInput?: string | Date) => {
    onDutyDays: number;
    offDutyDays: number;
};
//# sourceMappingURL=dutyDays.d.ts.map