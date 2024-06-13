/**
 * Utilities to download EEO reports of employees
 */
import csvUtils from './baseCsv.js';
import {
  subtract,
  add,
  startOf,
  endOf,
  format,
  getIsoWeekday,
  getTodaysDate,
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
let BATCH_SIZE = 50; // batch size for QB API parallel calls
let WORK_HOURS_PER_DAY = 8;

/**
 * Downloads array of employees EEO information as csv file.
 * @param employees - array of employees objects
 */
export async function download(employees, tags, options = { filename: null, startDate: null, endDate: null }) {
  let convertedEmployees = await convertEmployees(employees, options.startDate, options.endDate, tags); // convert employees into csv object (returns two arrays)
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
export async function convertEmployees(employees, startDate, endDate, tags) {
  // columns and their getter functions
  let cols = [
    {
      title: 'CASE ID',
      getter: getCaseId
    },
    {
      title: 'ADP ID',
      getter: getAdpId
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
  let adpPromise = api.getEmployeesFromAdp(); // run in background while qb runs
  await fillTimesheetData(employees, startDate, endDate);
  fillAdpData(employees, await adpPromise); // fill in ADP response into INFO var

  // build out one row per employee
  let rows = [];
  for (let e of employees) {
    // build out object based on cols array
    let row = {};
    for (let col of cols) row[col.title] = col.getter(e, startDate, endDate, tags);
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
 * @param startDate YYYY-MM-DD to get timsheet data from
 * @param endDate YYYY-MM-DD to get timesheet data until
 */
async function fillTimesheetData(employees, startDate, endDate) {
  // single month logic conversion
  let singleMonth = startDate === endDate ? startDate : null;
  if (singleMonth) startDate = subtract(startDate, 1, 'month', 'YYYY-MM-DD');

  // run API calls for each employee first (for easy batching)
  let batch = [];
  let batch_employees = []; // employee numbers, in same order as batch[]
  let promise, resps, resp, empNum;
  for (let i in employees) {
    // build promises
    promise = api.getTimesheetsData(employees[i].employeeNumber, { startDate, endDate, employeeId: employees[i].id });
    batch.push(promise);
    batch_employees.push(employees[i].employeeNumber);

    // run promises and fill data
    if (batch.length == BATCH_SIZE || i == employees.length - 1) {
      resps = await Promise.all(batch);

      // parse responses into INFO
      for (let k in resps) {
        // get response and map to employee
        resp = resps[k].timesheets?.[0]?.timesheets;
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
 * Fills in INFO with data from ADP, namely the ADP ID
 *
 * @param employees - employees to look for
 * @param adpInfo - raw ADP info from API call
 */
function fillAdpData(employees, adpInfo) {
  // make set of employee numbers from `employees`
  let employeeNums = new Set();
  for (let e of employees) employeeNums.add(e.employeeNumber);

  // fill in info from ADP
  let empNum, adpId;
  for (let e of adpInfo) {
    empNum = e?.customFieldGroup?.stringFields[0]?.stringValue;
    if (!empNum) continue; // skip if employee num wasn't found in adpInfo
    // fill in data to INFO
    if (!INFO[empNum]) INFO[empNum] = {};
    adpId = e.workAssignments[0]?.payrollFileNumber;
    if (adpId) adpId = Number(adpId); // remove leading 0s
    INFO[empNum]['adpId'] = adpId;
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
 * Gets employee ADP ID, based on INFO global var
 *
 * @param employee
 * @returns {String} employee CASE ID
 */
function getAdpId(employee) {
  return INFO[employee.employeeNumber]?.adpId || '---';
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
 * @param {String} startDate - The start date (in YYYY-MM-DD format)
 * @param {String} endDate - The end date (in YYYY-MM-DD format)
 * @param {Boolean} excludeProRated - Whether or not to pro-rate based on hire date (default is to pro-rate)
 * @return int - number of remaining working days
 */
function getWorkDays(employee, startDate, endDate) {
  // allow for employee to be null and just get total workdays in the month
  if (!employee) employee = { hireDate: subtract(getTodaysDate(), 100, 'year', 'YYYY-MM-DD') };

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
    // add day if it is a weekday
    if (isWeekDay(date)) workDays += 1;
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
  let totalWorkDays = getWorkDays(null, startOf(startDate, 'month'), endOf(startDate, 'month'));
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

  let result = totalWorkDays * proRatedHours;
  result = result.toFixed(2).replace(/[.,]00$/, '') || null;

  return result;
}

/**
 * Gets employee hours worked
 *
 * @param employee
 * @param _ unused startDate
 * @param __ unused endDate
 * @param tags tag information to search for CYK
 * @returns {String} employee hours worked
 */
function getEmployeeWorkedHours(employee, _, __, tags) {
  let n = employee.employeeNumber;
  if (!INFO[n]) return '---';
  let timesheets = INFO[n].timesheets;

  // exclude all nonbillable jobcodes for CASE employees, but only PTO for CYK employees
  let nonBillables = SUPP_DATA.nonBillables;
  let cykTag = tags.find((t) => t.tagName === 'CYK');
  if (cykTag.employees.includes(employee.id)) nonBillables = new Set(['PTO']);

  // tally up hours
  let total = 0;
  for (let jobcode in timesheets) {
    if (!nonBillables.has(jobcode)) {
      total += timesheets[jobcode] / 3600; // seconds to hours
    }
  }

  // format
  total = total.toFixed(2).replace(/[.,]00$/, '') || null;

  return total;
}

/**
 * Gets employee hours worked overtime based on
 * potential hours
 *
 * @param employee
 * @returns {String} employee hours worked over, floored at 0
 */
function getEmployeeHoursOver(employee, startDate, endDate, tags) {
  let n = employee.employeeNumber;
  if (!INFO[n]) return '---';

  let hoursOver =
    getEmployeeWorkedHours(employee, startDate, endDate, tags) -
    getEmployeePotentialHours(employee, startDate, endDate);

  // set min to 0 and format
  hoursOver = Math.max(0, hoursOver);
  hoursOver = hoursOver.toFixed(2).replace(/[.,]00$/, '') || null;

  return hoursOver;
}

export default {
  download,
  convertEmployees
};
// :)
