const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

function formatDate(date) {
  if (!date) return null;
  else {
    const [year, month, day] = date.split('-');
    if (moment(`${month}/${day}/${year}`, 'MM/DD/YYYY', true).isValid()) {
      return `${month}/${day}/${year}`;
    } else {
      return null;
    }
  }
}

/**
 * Takes an date object in ISO format 2020-01 and puts it in slash format 01/2020
 * @param {Date} date date in ISO format 2020-01
 */
function formatDateMonthYear(date) {
  if (!date) return null;
  else {
    const [year, month] = date.split('-');
    if (moment(`${month}/${year}`, 'MM/YYYY', true).isValid()) {
      return `${month}/${year}`;
    } else {
      return null;
    }
  }
} // formatDateMonthYear

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
}

/**
 * Takes an date object in in slash format MM/YYYY and translates it to valid ISO format YYYY-MM
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
  formatDate,
  formatDateMonthYear,
  parseDate,
  parseDateMonthYear
};
