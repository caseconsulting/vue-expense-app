/**
 * Utilities to download EEO reports of employees
 */
const csvUtils = require('./baseCsv.js');
import {
  subtract,
  add,
  startOf,
  endOf,
  format,
  getIsoWeekday,
  isSameOrAfter,
  isAfter,
  DEFAULT_ISOFORMAT
} from '@/shared/dateUtils.js';
import api from '@/shared/api.js';

/**
 * Global vars
 */
let INFO = {};
let SUPP_DATA = {
  nonBillables: new Set(['PTO'])
};
let BATCH_SIZE = 5;
let WORK_HOURS_PER_DAY = 8;

/**
 * Downloads array of employees EEO information as csv file.
 * @param employees - array of employees objects
 */
export async function download(employees, options = { filename: null, startDate: null, endDate: null }) {
  let convertedEmployees = await convertEmployees(employees, options.startDate, options.endDate); // convert employees into csv object (returns two arrays)
  let csvFileString = csvUtils.generate(convertedEmployees); // convert to csv file string
  if (!options.filename) options.filename = `EEO Compliance Report`;
  csvUtils.download(csvFileString, options.filename); // download csv file string as .csv
} // download

/**
 * Converts employees to an array of objects to pass in to csvUtils.generate(). Expects
 * an array of employees.
 * @param employees - expense object to convert
 * @return a new object passable to csv.js
 */
export async function convertEmployees(employees, startDate, endDate) {
  // columns and their getter functions
  let cols = [
    {
      title: 'CASE ID',
      getter: getCaseId
    },
    {
      title: 'Employee Name',
      getter: getEmployeeName
    },
    {
      title: 'Potential Monthly Hours',
      getter: getMonthHours
    },
    {
      title: 'Potential Employee Specific Hours',
      getter: getEmployeePotentialHours
    },
    {
      title: 'Actual Billable Hours Worked',
      getter: getEmployeeWorkedHours
    },
    {
      title: 'Actual Hours Over Potential',
      getter: getEmployeeHoursOver
    }
  ];

  // fill in INFO data
  await fillTimesheetData(employees, startDate, endDate);

  // build out one row per employee
  let rows = [];
  for (let e of employees) {
    // build out object based on cols array
    let row = {};
    for (let col of cols) row[col.title] = col.getter(e, startDate, endDate);
    rows.push(row);
  }

  // sort by employee number, ascending
  rows.sort((a, b) => {
    return a['CASE ID'] > b['CASE ID'];
  });

  return rows;
} // convertEmployees

/**
 * Fills in INFO with employee timesheet information
 *
 * @param employees list of employees to get data for
 * @param startDate YYYY-MM to get timsheet data from
 * @param endDate YYYY-MM to get timesheet data until
 */
async function fillTimesheetData(employees, startDate, endDate) {
  // single month logic conversion
  let singleMonth = startDate === endDate ? startDate : null;
  if (singleMonth) startDate = subtract(startDate, 1, 'month', 'YYYY-MM');

  // run API calls for each employee first (for easy batching)
  let batch = [];
  let batch_employees = []; // employee numbers, in same order as batch[]
  let promise, resps, resp, empNum;
  for (let i in employees) {
    // build promises
    promise = api.getTimesheetsData(employees[i].employeeNumber, startDate, endDate, false);
    batch.push(promise);
    batch_employees.push(employees[i].employeeNumber);

    // run promises and fill data
    if (batch.length == BATCH_SIZE || i == employees.length - 1) {
      resps = await Promise.all(batch);

      // parse responses into INFO
      for (let k in resps) {
        // get response and map to employee
        resp = resps[k].timesheets;
        empNum = batch_employees[k];
        if (!resp) continue;
        // add any non-billables we don't have
        SUPP_DATA.nonBillables.add(...resps[k].supplementalData.nonBillables);
        // get rid of month we don't actually care about
        if (singleMonth) resp = { [singleMonth]: resp[singleMonth] };

        // add response to employee
        if (!INFO[empNum]) INFO[empNum] = {};
        INFO[empNum]['timesheets'] = resp;
      }
      // clear batches
      batch = [];
      batch_employees = [];
    }
  }
}

/**
 * Gets employee CASE ID
 *
 * @param employee
 * @returns {String} employee CASE ID
 */
function getCaseId(employee) {
  return employee.employeeNumber;
}

/**
 * Gets employee name
 *
 * @param employee
 * @returns {String} employee name: First Last (Nick)
 */
function getEmployeeName(employee) {
  // get first and last name, append nickname if it exists
  let name = `${employee.lastName}, ${employee.firstName}`;
  if (employee.nickname) name += ` (${employee.nickname})`;

  return name;
}

/**
 * Calculates and returns the work days between start and end dates provided
 *
 * @param {String} startDate - The start date (in YYYY-MM format)
 * @param {String} endDate - The end date (in YYYY-MM format)
 * @param {Boolean} excludeProRated - Whether or not to pro-rate based on hire date (default is to pro-rate)
 * @return int - number of remaining working days
 */
function getWorkDays(employee, startDate, endDate) {
  function isWeekDay(day) {
    return getIsoWeekday(day) >= 1 && getIsoWeekday(day) <= 5;
  }

  let workDays = 0;
  startDate = format(startOf(startDate, 'month'), DEFAULT_ISOFORMAT);
  endDate = format(endOf(endDate, 'month'), DEFAULT_ISOFORMAT);
  if (isAfter(employee.hireDate, startDate, 'day') && isSameOrAfter(endDate, employee.hireDate, 'day')) {
    startDate = employee.hireDate;
  }
  let date = startDate;
  while (!isAfter(date, endDate, 'day')) {
    if (isWeekDay(date)) {
      workDays += 1;
    }
    // increment to the next day
    date = add(date, 1, 'day', DEFAULT_ISOFORMAT);
  }
  return workDays;
} // getWorkDays

/**
 * Gets monthly hours for CASE
 *
 * @param _ slot for employee, unused
 * @param startDate
 * @returns {String} monthly hours for full-time CASE employees in MONTH
 */
function getMonthHours(employee, startDate) {
  let totalWorkDays = getWorkDays(employee, startOf(startDate, 'month'), endOf(startDate, 'month'));
  return totalWorkDays * WORK_HOURS_PER_DAY;
}

/**
 * Gets employee potential hours based on month and
 * work status (eg. part time or full time)
 *
 * TODO: support date ranges?
 *
 * @param employee
 * @returns {String} employee prorated hours for month
 */
function getEmployeePotentialHours(employee, startDate, endDate) {
  // get employee info and yeet if it isn't there
  let n = employee.employeeNumber;
  if (!INFO[n]) return '---';

  // total work days in the month, hours prorated as a fraction of 100 (aka a percent in decimal form)
  let totalWorkDays = getWorkDays(employee, startOf(startDate, 'month'), endOf(endDate, 'month'));
  let proRatedHours = WORK_HOURS_PER_DAY * (employee.workStatus / 100);

  return totalWorkDays * proRatedHours;
}

/**
 * Gets employee hours worked
 *
 * @param employee
 * @returns {String} employee hours worked
 */
function getEmployeeWorkedHours(employee) {
  let n = employee.employeeNumber;
  if (!INFO[n]) return '---';
  let timesheets = INFO[n].timesheets;

  // tally up hours
  let total = 0;
  for (let month in timesheets) {
    for (let jobcode in timesheets[month]) {
      if (!SUPP_DATA.nonBillables.has(jobcode)) {
        total += timesheets[month][jobcode] / 3600; // seconds to hours
      }
    }
  }

  return total;
}

/**
 * Gets employee hours worked overtime based on
 * potential hours
 *
 * @param employee
 * @returns {String} employee hours worked over, floored at 0
 */
function getEmployeeHoursOver(employee, startDate, endDate) {
  let n = employee.employeeNumber;
  if (!INFO[n]) return '---';

  let hoursOver =
    getEmployeeWorkedHours(employee, startDate, endDate) - getEmployeePotentialHours(employee, startDate, endDate);

  return Math.max(0, hoursOver);
}

// :)
