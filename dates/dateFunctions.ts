import dayjs from "dayjs";


/**
 * @param date - Date string in format YYYY-MM-DD
 * @returns timestamp of the date
 */
export const covertDateIntoTimestamp = (date?: string): number => {
  const dateObj = date ? dayjs.utc(date) : dayjs.utc();
  if (!dateObj.isValid()) {
    return 0;
  }
  const finalDate = dateObj.startOf("day").valueOf();
  return finalDate;
};

export const isFutureDateUTC = (date: string): boolean => {
  if (!date) return false;
  const convertedDate = covertDateIntoTimestamp(date);
  const currentDate = covertDateIntoTimestamp();
  return convertedDate > currentDate;
};
