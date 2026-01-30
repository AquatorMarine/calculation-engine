import { RotationConstants } from "./constant.js";

export type RotationUserStatusType =
  (typeof RotationConstants.ROTATION_USER_STATUS)[keyof typeof RotationConstants.ROTATION_USER_STATUS];
