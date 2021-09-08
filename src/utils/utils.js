import dateUtils from '@/shared/dateUtils';
import MobileDetect from 'mobile-detect';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import _ from 'lodash';

/**
 * Async function to loop an array.
 *
 * @param array - Array of elements to iterate over
 * @param callback - callback function
 */
export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
} // asyncForEach

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
 * Formats a date (dates that only have months and years).
 *
 * @param date - date to format
 * @return Date - formatted date
 */
export function formatDateMonthYear(date) {
  return dateUtils.formatDateMonthYear(date);
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
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0) || (_.isArray(value) && _.isEmpty(value));
} // isEmpty

/**
 * Checks if an employee is full time. Returns true if the employee is full time, otherwise returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is full time
 */
export function isFullTime(employee) {
  return employee.workStatus == 100;
} // isFullTime

/**
 * Checks if an employee is inactive. Returns true if the employee is inactive with a work status of 0, otherwise
 * returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is inactive
 */
export function isInactive(employee) {
  return employee.workStatus == 0;
} // isInactive

/**
 * Checks if the current device used is mobile. Return true if it is mobile. Returns false if it is not mobile.
 *
 * @return boolean - if the device is mobile
 */
export function isMobile() {
  let md = new MobileDetect(window.navigator.userAgent);
  return md.os() === 'AndroidOS' || md.os() === 'iOS';
} // isMobile

/**
 * Checks if an employee is part time. Returns true if the employee is part time with a work status between 0 and 100,
 * otherwise returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is part time
 */
export function isPartTime(employee) {
  return employee.workStatus > 0 && employee.workStatus < 100;
} // isPartTime

/**
 * Convert a value to a 2 deciaml currency with prepended $.
 *
 * @param value - value to convert
 * @return String - money format
 */
export function convertToMoneyString(value) {
  return `${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`;
} // convertToMoneyString

/**
 * Returns a date formated as 'MMM Do, YYYY' (Aug 18th, 2020).
 *
 * @param date - date to format
 * @return String - date formated
 */
export function monthDayYearFormat(date) {
  return !isEmpty(date) ? moment(date).format('MMM Do, YYYY') : '';
} // monthDayYearFormat

/**
 * Returns a date formated as 'MMM YYYY' (Aug 2020).
 *
 * @param date - date to format
 * @return String - date formated
 */
export function monthYearFormat(date) {
  return !isEmpty(date) ? moment(date).format('MMM YYYY') : '';
} // monthYearFormat

/**
 * Returns a date formated as 'MMM Do' (Aug 18th).
 *
 * @param date - date to format
 * @return String - date formated
 */
export function monthDayFormat(date) {
  return !isEmpty(date) ? moment(date).format('MMM Do') : '';
} // monthDayFormat

/**
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
export function parseDate(date) {
  return dateUtils.parseDate(date);
} // parseDate

/**
 * Parse a date to isoformat (YYYY-MM).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
export function parseDateMonthYear(date) {
  return dateUtils.parseDateMonthYear(date);
} // parseDate
