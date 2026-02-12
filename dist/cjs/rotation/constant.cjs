"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotationConstants = exports.ROTATION_GROUP_STATUS_LABEL = exports.ROTATION_GROUP_STATUS = exports.ROTATION_USER_STATUS_LABEL = exports.ROTATION_USER_STATUS = void 0;
exports.ROTATION_USER_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
};
exports.ROTATION_USER_STATUS_LABEL = {
    [exports.ROTATION_USER_STATUS.ACTIVE]: "Active",
    [exports.ROTATION_USER_STATUS.INACTIVE]: "Inactive",
};
/** Rotation group (RotationLeave) status. Use for group-level status instead of isDeleted. */
exports.ROTATION_GROUP_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ENDED: "ended",
};
exports.ROTATION_GROUP_STATUS_LABEL = {
    [exports.ROTATION_GROUP_STATUS.ACTIVE]: "Active",
    [exports.ROTATION_GROUP_STATUS.INACTIVE]: "Inactive",
    [exports.ROTATION_GROUP_STATUS.ENDED]: "Ended",
};
const RotationConstants = {
    ROTATION_USER_STATUS: exports.ROTATION_USER_STATUS,
    ROTATION_USER_STATUS_LABEL: exports.ROTATION_USER_STATUS_LABEL,
    ROTATION_GROUP_STATUS: exports.ROTATION_GROUP_STATUS,
    ROTATION_GROUP_STATUS_LABEL: exports.ROTATION_GROUP_STATUS_LABEL,
};
exports.RotationConstants = RotationConstants;
