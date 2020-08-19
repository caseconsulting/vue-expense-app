import dateUtils from '@/shared/dateUtils';
import _ from 'lodash';

/**
 * Formats a date.
 *
 * @param date - date to format
 * @return Date - formatted date
 */
export function formatDate(date) {
  return dateUtils.formatDate(date);
} // formatDate

/**
 * Returns a date formated from YYYY-MM-DD to MM/DD/YYYY.
 *
 * @param date - YYYY-MM-DD String date
 * @return String - MM/DD/YYYY date
 */
export function formatDateDashToSlash(date) {
  if (!date) {
    return null;
  }
  const [year, month, day] = date.split('-');
  return `${month}/${day}/${year}`;
} // formatDateDashToSlash

/**
 * Returns a date formated from MM/DD/YYYY to YYYY-MM-DD.
 *
 * @param date - MM/DD/YYYY String date
 * @return String - YYYY-MM-DD date
 */
export function formatDateSlashToDash(date) {
  if (!date) {
    return null;
  }
  const [month, day, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // formatDateSlashToDash
} // formatDateSlashToDash

/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
export function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

/**
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
export function parseDate(date) {
  return dateUtils.parseDate(date);
} // parseDate
