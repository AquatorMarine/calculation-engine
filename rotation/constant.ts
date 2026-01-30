export const ROTATION_USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const ROTATION_USER_STATUS_LABEL = {
  [ROTATION_USER_STATUS.ACTIVE]: "Active",
  [ROTATION_USER_STATUS.INACTIVE]: "Inactive",
} as const;

const RotationConstants = {
  ROTATION_USER_STATUS,
  ROTATION_USER_STATUS_LABEL,
};

export { RotationConstants };
