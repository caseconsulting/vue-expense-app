const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
var timezone = require('dayjs/plugin/timezone');
var customParseFormat = require('dayjs/plugin/customParseFormat');
var localizedFormat = require('dayjs/plugin/localizedFormat');
var advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

// constants
export const DEFAULT_ISOFORMAT = 'YYYY-MM-DD';
export const FORMATTED_ISOFORMAT = 'MM/DD/YYYY';
export const PARSED_ISOFORMAT = 'YYYY-MM-DD';

/**
 * Adds an amount to the given date.
 *
 * EXAMPLE: add('2022-10-16', 1, 'M') => OUTPUT: '2022-11-16'
 *
 * @param {String} date - The date to add to
 * @param {Number} amount - The amount to add
 * @param {String} granularity - The unit to add (https://day.js.org/docs/en/manipulate/start-of#list-of-all-available-units)
 * @returns String - The added date
 */
export function add(date, amount, granularity) {
  return dayjs(date).add(amount, granularity).format(DEFAULT_ISOFORMAT);
} // add

/**
 * Subtracts an amount from the given date.
 *
 * EXAMPLE: subtract('2022-12-24', 2, 'd') => OUTPUT: '2022-12-22'
 *
 * @param {String} date - The date to subtract from
 * @param {Number} amount - The amount to subtract
 * @param {String} granularity - The unit to subtract (https://day.js.org/docs/en/manipulate/start-of#list-of-all-available-units)
 * @returns String - The subtracted date
 */
export function subtract(date, amount, granularity) {
  return dayjs(date).subtract(amount, granularity).format(DEFAULT_ISOFORMAT);
} // subtract

/**
 * Verifies if the first date is after the second date in time.
 *
 * EXAMPLES: isAfter('2022-12-24', '2022-12-23')         => OUTPUT: true
 *           isAfter('2022-12-23', '2022-12-23')         => OUTPUT: false
 *           isAfter('2022-12-23', '2022-12-18', 'M')    => OUTPUT: true
 *
 * @param {String} date1 - The first date
 * @param {String} date2 - The second date
 * @param {String} granularity - (OPTIONAL) The unit to compare (https://day.js.org/docs/en/manipulate/start-of#list-of-all-available-units)
 * @returns Boolean - True if the first date comes after the second date, false otherwise
 */
export function isAfter(date1, date2, granularity) {
  if (granularity) {
    return dayjs(date1, DEFAULT_ISOFORMAT, true).isAfter(dayjs(date2, DEFAULT_ISOFORMAT, true), granularity);
  } else {
    return dayjs(date1, DEFAULT_ISOFORMAT, true).isAfter(dayjs(date2, DEFAULT_ISOFORMAT, true));
  }
} // isAfter

/**
 * Verifies if the first date is before the second date in time.
 *
 * EXAMPLES: isBefore('2022-12-23', '2022-12-24')         => OUTPUT: true
 *           isBefore('2022-12-16', '2022-12-16')         => OUTPUT: false
 *           isBefore('2022-12-14', '2022-12-16', 'M')    => OUTPUT: false
 *
 * @param {String} date1 - The first date
 * @param {String} date2 - The second date
 * @param {String} granularity - (OPTIONAL) The unit to compare (https://day.js.org/docs/en/manipulate/start-of#list-of-all-available-units)
 * @returns Boolean - True if the first date comes before the second date, false otherwise
 */
export function isBefore(date1, date2, granularity) {
  if (granularity) {
    return dayjs(date1, DEFAULT_ISOFORMAT, true).isBefore(dayjs(date2, DEFAULT_ISOFORMAT, true), granularity);
  } else {
    return dayjs(date1, DEFAULT_ISOFORMAT, true).isBefore(dayjs(date2, DEFAULT_ISOFORMAT, true));
  }
} // isBefore

/**
 * Formats a given date and returns the output of the newly formatted date.
 *
 * EXAMPLES: format('2022-12-23', 'MM/DD/YYYY')         => OUTPUT: '12/23/2022'
 *           format('12/16/2022', 'YYYY-MM-DD')         => OUTPUT: '2022-12-16'
 *           format('12/23/2022', 'LLL')                => OUTPUT: 'December 23, 2022 12:00 AM'
 *
 * @param {String} date - The date to format
 * @param {String} format - The format output (https://day.js.org/docs/en/display/format)
 */
export function format(date, oldFormat, newFormat) {
  if (oldFormat) {
    return dayjs(date, oldFormat).format(newFormat);
  } else {
    return dayjs(date).format(newFormat);
  }
} // format

/**
 * Sets the dates year and returns a string of the date.
 *
 * @param {String} date The given date
 * @param {Number} year The year to set the date to
 * @returns String - The date at the given year
 */
export function setYear(date, year) {
  return dayjs(date).year(year).format(DEFAULT_ISOFORMAT);
} // setYear

/**
 * Returns today's date.
 *
 * @param {String} format - The format output (https://day.js.org/docs/en/display/format)
 * @returns String - Today's date
 */
export function getTodaysDate(format) {
  if (format) {
    return dayjs().format(format);
  } else {
    return dayjs().format(DEFAULT_ISOFORMAT);
  }
} // getTodaysDate

/**
 * formats the given date in MM/DD/YYYY
 *
 * @param date - the date to be formatted
 * @return - the formatted date
 */
function formatDate(date) {
  if (!date) return null;
  else {
    const [year, month, day] = date.split('-');
    if (dayjs(`${month}/${day}/${year}`, 'MM/DD/YYYY', true).isValid()) {
      return `${month}/${day}/${year}`;
    } else {
      return null;
    }
  }
} // formatDate

/**
 * Takes an date object in ISO format 2020-01 and puts it in slash format 01/2020
 * @param {Date} date date in ISO format 2020-01
 */
function formatDateMonthYear(date) {
  if (!date) return null;
  else {
    const [year, month] = date.split('-');
    if (dayjs(`${month}/${year}`, 'MM/YYYY', true).isValid()) {
      return `${month}/${year}`;
    } else {
      return null;
    }
  }
} // formatDateMonthYear

/**
 * parses the date to pad out date to return correct format
 *
 * @param {*} date - date to parse
 * @return - the formatted date
 */
function parseDate(date) {
  if (!date) return null;
  else {
    const [month, day, year] = date.split('/');
    if (month != undefined && day != undefined && year != undefined) {
      if (year <= 40) {
        return `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        return `${year.padStart(4, '19')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    } else {
      return date;
    }
  }
} // parseDate

/**
 * Takes an date object in in slash format MM/YYYY and translates it to valid ISO format YYYY-MM
 *
 * @param {Date} date date in ISO format 2020-01
 */
function parseDateMonthYear(date) {
  if (!date) return null;
  else {
    const [month, year] = date.split('/');
    if (month != undefined && year != undefined) {
      if (year <= 40) {
        return `${year.padStart(4, '20')}-${month.padStart(2, '0')}`;
      } else {
        return `${year.padStart(4, '19')}-${month.padStart(2, '0')}`;
      }
    } else {
      return date;
    }
  }
} //parseDateMonthYear

export default {
  DEFAULT_ISOFORMAT,
  FORMATTED_ISOFORMAT,
  PARSED_ISOFORMAT,
  format,
  formatDate,
  formatDateMonthYear,
  isAfter,
  isBefore,
  parseDate,
  parseDateMonthYear,
  setYear
};
