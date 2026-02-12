import { RotationConstants } from "./constant.js";

export type RotationUserStatusType =
  (typeof RotationConstants.ROTATION_USER_STATUS)[keyof typeof RotationConstants.ROTATION_USER_STATUS];

export type RotationUserStatusLabelType =
  (typeof RotationConstants.ROTATION_USER_STATUS_LABEL)[keyof typeof RotationConstants.ROTATION_USER_STATUS_LABEL];

export type RotationGroupStatusType =
  (typeof RotationConstants.ROTATION_GROUP_STATUS)[keyof typeof RotationConstants.ROTATION_GROUP_STATUS];

export type RotationGroupStatusLabelType =
  (typeof RotationConstants.ROTATION_GROUP_STATUS_LABEL)[keyof typeof RotationConstants.ROTATION_GROUP_STATUS_LABEL];