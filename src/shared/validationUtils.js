import { isEmpty } from '@/utils/utils';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

/**
 * Gets the optional date rules in MM/DD/YYYY format.
 * @returns Array - The array of rule functions
 */
export function getDateOptionalRules() {
  return [
    (v) => {
      return !isEmpty(v)
        ? (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) && moment(v, 'MM/DD/YYYY').isValid()) ||
            'Date must be valid. Format: MM/DD/YYYY'
        : true;
    }
  ]; // rules for an optional date
} // getDateOptionalRules

/**
 * Gets the optional date rules in MM/YYYY format.
 * @returns Array - The array of rule functions
 */
export function getDateMonthYearOptionalRules() {
  return [
    (v) => {
      return !isEmpty(v)
        ? (/[\d]{2}\/[\d]{4}/.test(v) && moment(v, 'MM/YYYY').isValid()) || 'Date must be valid. Format: MM/DD/YYYY'
        : true;
    }
  ]; // rules for an optional date
} // getDateMonthYearOptionalRules

/**
 * Gets the date rules in MM/DD/YYYY format.
 * @returns Array - The array of rule functions
 */
export function getDateRules() {
  return [
    (v) =>
      (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) && moment(v, 'MM/DD/YYYY').isValid()) ||
      'Date must be valid. Format: MM/DD/YYYY'
  ]; // rules for a required MM/DD/YYYY date
} // getDateRules

/**
 * Gets the date rules in MM/YYYY format.
 * @returns Array - The array of rule functions
 */
export function getDateMonthYearRules() {
  // rules for a required MM/YYYY date
  return [
    (v) =>
      (!isEmpty(v) && /[\d]{2}\/[\d]{4}/.test(v) && moment(v, 'MM/YYYY').isValid()) ||
      'Date must be valid. Format: MM/YYYY'
  ];
} // getDateMonthYearRules

/**
 * Gets the rules where a date must come before today's date.
 * @returns Array - The array of rule functions
 */
export function getNonFutureDateRules() {
  return [(v) => moment(v, 'MM/DD/YYYY').isBefore(moment()) || 'Date must be before today'];
} // getNonFutureDateRules

/**
 * Gets the rules where a whole number must be positive.
 * @returns Array - The array of rule functions
 */
export function getNumberRules() {
  return [(v) => /^\d+$/.test(v) || 'Must be a positive number'];
} // getNumberRules

/**
 * Gets the rules where a field is required and must not be empty.
 * @returns Array - The array of rule functions
 */
export function getRequiredRules() {
  return [(v) => !isEmpty(v) || 'This field is required']; // rules for a required field
} // getRequiredRules

/**
 * Gets the URL rules
 * @returns Array - The array of rule functions
 */
export function getURLRules() {
  return [
    (v) =>
      isEmpty(v) ||
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(v) ||
      'URL must be valid. Only http(s) are accepted.'
  ]; // rules for training url
}
