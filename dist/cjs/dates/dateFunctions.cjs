"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFutureDateUTC = exports.covertDateIntoTimestamp = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
/**
 * @param date - Date string in format YYYY-MM-DD
 * @returns timestamp of the date
 */
const covertDateIntoTimestamp = (date) => {
    const dateObj = date ? dayjs_1.default.utc(date) : dayjs_1.default.utc();
    if (!dateObj.isValid()) {
        return 0;
    }
    const finalDate = dateObj.startOf("day").valueOf();
    return finalDate;
};
exports.covertDateIntoTimestamp = covertDateIntoTimestamp;
const isFutureDateUTC = (date) => {
    if (!date)
        return false;
    const convertedDate = (0, exports.covertDateIntoTimestamp)(date);
    const currentDate = (0, exports.covertDateIntoTimestamp)();
    return convertedDate > currentDate;
};
exports.isFutureDateUTC = isFutureDateUTC;
