import { isEmpty } from '@/utils/utils';
import { getTodaysDate, isBefore, isValid } from '@/shared/dateUtils';
import store from '../../store/index';
import _ from 'lodash';

/**
 * Gets the optional date rules in MM/DD/YYYY format.
 * @return Array - The array of rule functions
 */
export function getDateOptionalRules() {
  return [
    (v) => {
      return !isEmpty(v)
        ? (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) && isValid(v, 'MM/DD/YYYY')) || 'Date must be valid. Format: MM/DD/YYYY'
        : true;
    }
  ]; // rules for an optional date
} // getDateOptionalRules

/**
 * Gets the optional date rules in MM/YYYY format.
 * @return Array - The array of rule functions
 */
export function getDateMonthYearOptionalRules() {
  return [
    (v) => {
      return !isEmpty(v)
        ? (/[\d]{2}\/[\d]{4}/.test(v) && isValid(v, 'MM/YYYY')) || 'Date must be valid. Format: MM/YYYY'
        : true;
    }
  ]; // rules for an optional date
} // getDateMonthYearOptionalRules

/**
 * Gets the date rules in MM/DD/YYYY format.
 * @return Array - The array of rule functions
 */
export function getDateRules() {
  return [
    (v) =>
      (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) && isValid(v, 'MM/DD/YYYY')) ||
      'Date must be valid. Format: MM/DD/YYYY'
  ]; // rules for a required MM/DD/YYYY date
} // getDateRules

/**
 * Gets the date rules in MM/YYYY format.
 * @return Array - The array of rule functions
 */
export function getDateMonthYearRules() {
  // rules for a required MM/YYYY date
  return [
    (v) => (!isEmpty(v) && /[\d]{2}\/[\d]{4}/.test(v) && isValid(v, 'MM/YYYY')) || 'Date must be valid. Format: MM/YYYY'
  ];
} // getDateMonthYearRules

/**
 * Gets the rules where a date must come before today's date.
 * @return Array - The array of rule functions
 */
export function getNonFutureDateRules() {
  return [(v) => isBefore(v, getTodaysDate('MM/DD/YYYY'), null, 'MM/DD/YYYY') || 'Date must be before today'];
} // getNonFutureDateRules

/**
 * Gets the rules where a whole number must be positive.
 * @return Array - The array of rule functions
 */
export function getNumberRules() {
  return [(v) => /^\d+$/.test(v) || 'Must be a positive number'];
} // getNumberRules

/**
 * Gets rules for phone numbers.
 * @return Array - The array of rule functions
 */
export function getPhoneNumberRules() {
  return [(v) => (!this.isEmpty(v) && v.length === 12) || 'Phone number must be valid. Format: ###-###-####'];
} // getPhoneNumberRules

/**
 * Gets the rules where a whole number must be positive.
 * @return Array - The array of rule functions
 */
export function getPhoneNumberTypeRules() {
  return [(v) => !isEmpty(v) || 'Must choose one selection'];
} // getPhoneNumberTypeRules

/**
 * Gets the rules where a field is required and must not be empty.
 * @return Array - The array of rule functions
 */
export function getRequiredRules() {
  return [(v) => !isEmpty(v) || 'This field is required']; // rules for a required field
} // getRequiredRules

/**
 * Gets the URL rules
 * @return Array - The array of rule functions
 */
export function getURLRules() {
  return [
    (v) =>
      isEmpty(v) ||
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(v) ||
      'URL must be valid. Only http(s) are accepted.'
  ]; // rules for training url
} // getURLRules

/**
 * Gets the rules for validating employee hire/departure dates
 * @returns Array - The array of rule functions
 */
export function getValidateFalse() {
  return [(v) => isEmpty(v) || 'Departure date must be after hire date'];
} // getValidateRules

/**
 *  Gets the rules for validating employee PTO Cash Out request
 * @param ptoLimit employee's available PTO
 * @returns Array - The array of rule functions
 */
export function getPTOCashOutRules(ptoLimit, employeeId) {
  let pendingCashOuts = _.filter(store.getters.ptoCashOuts, (p) => !p.approvedDate && employeeId === p.employeeId);
  let pendingAmount = pendingCashOuts.reduce((n, { amount }) => n + amount, 0);
  return [
    (v) => (!isEmpty(v) && v > 0) || `PTO cash out amount must be greater than 0`,
    (v) =>
      (!isEmpty(v) && v + pendingAmount > ptoLimit) ||
      `PTO cash out amount can not exceed available PTO (${ptoLimit} hrs)`,
    (v) =>
      (!isEmpty(v) && ptoLimit - v - pendingAmount >= 40) ||
      'A minimum balance of 40h must be maintained after a cash out'
  ];
} // getPTOCashOutRules
