import { isEmpty } from '@/utils/utils';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

export function getDateOptionalRules() {
  return [
    (v) => {
      return !isEmpty(v)
        ? (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) && moment(v, 'MM/DD/YYYY').isValid()) ||
            'Date must be valid. Format: MM/DD/YYYY'
        : true;
    }
  ]; // rules for an optional date
}

export function getDateRules() {
  return [
    (v) =>
      (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) && moment(v, 'MM/DD/YYYY').isValid()) ||
      'Date must be valid. Format: MM/DD/YYYY'
  ]; // rules for a required MM/DD/YYYY date
}

export function getMonthYearDateRules() {
  // rules for a required MM/YYYY date
  return [
    (v) =>
      (!isEmpty(v) && /[\d]{2}\/[\d]{4}/.test(v) && !moment(v, 'MM/YYYY').isValid()) ||
      'Date must be valid. Format: MM/YYYY'
  ];
}

export function getNonFutureDateRules() {
  return [(v) => moment(v, 'MM/DD/YYYY').isBefore(moment()) || 'Date must be before today'];
}

export function getNumberRules() {
  return [(v) => /^\d+$/.test(v) || 'Must be a positive number'];
}

export function getRequiredRules() {
  return [(v) => !isEmpty(v) || 'This field is required']; // rules for a required field
}
