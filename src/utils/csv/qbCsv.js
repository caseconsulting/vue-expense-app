/**
 * Yes the format is ugly, but it is based on a specific format that Paul needs.
 * We use the same format to avoid copy/pasting errors. Here's an image of a
 * similar form: https://image.cnbcfm.com/api/v1/image/104695920-OldEEO-1.png
 */

/**
 * Utilities to download EEO reports of employees
 */
const csvUtils = require('./baseCsv.js');
import { subtract, add } from '@/shared/dateUtils.js';
import api from '@/shared/api.js';
import _ from 'lodash';

/**
 * Global cars to help not run API calls over and over
 */
let INFO = {};
let BATCH_SIZE = 5;

/**
 * Downloads array of employees EEO information as csv file.
 * @param employees - array of employees objects
 */
export async function download(employees, options = { filename: null, startDate: null, endDate: null }) {
  let convertedEmployees = await convertEmployees(employees, options.startDate, options.endDate); // convert employees into csv object (returns two arrays)
  // let csvFileString = csvUtils.generateFrom2dArray(convertedEmployees[0]); // convert to csv file string
  // if (!options.filename) options.filename = `EEO Compliance Report`;
  // csvUtils.download(csvFileString, options.filename); // download csv file string as .csv
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
    // {
    //   title: 'ADP ID',
    //   getter: getAdpId
    // },
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

  // TODO: single month logic
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
    // run promises
    if (batch.length === BATCH_SIZE || i === employees.length - 1) {
      try {
        resps = await Promise.all(batch);
        for (let i in resps) {
          resp = resps[i];
          empNum = batch_employees[i];
          if (!INFO[empNum]) INFO[empNum] = {};
          INFO[empNum]['timesheets'] = resp;
        }
      } catch (e) {
        // TODO: just error on the one employee or something
        console.log('Error while getting employee info from Quickbooks:');
        console.error(e);
      }
      // clear batches
      batch = [];
      batch_employees = [];
    }
  
  if (singleMonth) startDate = add(startDate, 1, 'month', 'YYYY-MM');

  // build out one row per employee
  let rows = [];
  for (let e of employees) {
    // build out object based on cols array
    let row = {};
    for (let col of cols) row[col.title] = col.getter(e, startDate, endDate);
    rows.push(row);
  }

  return rows;
} // convertEmployees

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
 * ::TODO::
 * Gets employee ADP ID
 * 
 * @param employee 
 * @returns {String} employee ADP ID
 *
function getAdpId(employee){
  return '';
}
*/

/**
 * Gets employee name
 *
 * @param employee
 * @returns {String} employee name: First Last (Nick)
 */
function getEmployeeName(employee) {
  let name = `${employee.firstName} ${employee.lastName}`;
  if (employee.nickname) name += ` (${employee.nickname})`;
  return name;
}

/**
 * Gets monthly hours for CASE (TODO: how to determine MONTH)
 *
 * @param employee
 * @returns {String} monthly hours for full-time CASE employees in MONTH
 */
function getMonthHours(employee, startDate, endDate) {
  return 'c';
}

/**
 * Gets employee potential hours based on month and
 * work status (eg. part time or full time)
 *
 * @param employee
 * @returns {String} employee prorated hours for month
 */
function getEmployeePotentialHours(employee) {
  return 'd';
}

/**
 * Gets employee hours worked
 *
 * @param employee
 * @returns {String} employee hours worked
 */
function getEmployeeWorkedHours(employee) {
  return 'e';
}

/**
 * Gets employee hours worked overtime based on
 * potential hours
 *
 * @param employee
 * @returns {String} employee hours worked over, floored at 0
 */
function getEmployeeHoursOver(employee) {
  return 'f';
}
