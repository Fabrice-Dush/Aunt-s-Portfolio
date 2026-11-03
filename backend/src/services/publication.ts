import { AppError } from '../utils/AppError.js';

export function validatePeriod(record: { startYear?: number | null; endYear?: number | null; isCurrent?: boolean }) {
  if ((record.startYear != null && record.endYear != null && record.endYear < record.startYear)
    || (record.isCurrent && record.endYear != null)) {
    throw new AppError(400, 'INVALID_PERIOD', 'End year must follow start year; current positions cannot have an end year');
  }
}
export function requireVerified(record: { isVerified?: boolean }) {
  if (record.isVerified === false) throw new AppError(409, 'UNVERIFIED_CONTENT', 'Verify content before publication');
}
