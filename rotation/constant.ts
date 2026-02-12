export const ROTATION_USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const ROTATION_USER_STATUS_LABEL = {
  [ROTATION_USER_STATUS.ACTIVE]: "Active",
  [ROTATION_USER_STATUS.INACTIVE]: "Inactive",
} as const;

/** Rotation group (RotationLeave) status. Use for group-level status instead of isDeleted. */
export const ROTATION_GROUP_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ENDED: "ended",
} as const;

export const ROTATION_GROUP_STATUS_LABEL = {
  [ROTATION_GROUP_STATUS.ACTIVE]: "Active",
  [ROTATION_GROUP_STATUS.INACTIVE]: "Inactive",
  [ROTATION_GROUP_STATUS.ENDED]: "Ended",
} as const;

const RotationConstants = {
  ROTATION_USER_STATUS,
  ROTATION_USER_STATUS_LABEL,
  ROTATION_GROUP_STATUS,
  ROTATION_GROUP_STATUS_LABEL,
};

export { RotationConstants };
