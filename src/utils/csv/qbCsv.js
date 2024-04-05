/**
 * Yes the format is ugly, but it is based on a specific format that Paul needs.
 * We use the same format to avoid copy/pasting errors. Here's an image of a
 * similar form: https://image.cnbcfm.com/api/v1/image/104695920-OldEEO-1.png
 */

/**
 * Utilities to download EEO reports of employees
 */
const csvUtils = require('./baseCsv.js');
import _ from 'lodash';

/**
 * Downloads array of employees EEO information as csv file.
 * @param employees - array of employees objects
 */
export function download(employees, filename = null) {
  let convertedEmployees = convertEmployees(employees); // convert employees into csv object (returns two arrays)
  let csvFileString = csvUtils.generateFrom2dArray(convertedEmployees[0]); // convert to csv file string
  if (!filename) filename = `EEO Compliance Report`;
  csvUtils.download(csvFileString, filename); // download csv file string as .csv
} // download

/**
 * Converts employees to an array of objects to pass in to csvUtils.generate(). Expects
 * an array of employees.
 * @param employees - expense object to convert
 * @return a new object passable to csv.js
 */
export function convertEmployees(employees) {
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
    },
  ]

  _.forEach(employees, (e) => {
    // object to build out
    let row = {};

    // CASE employee ID
    row.
  });
} // convertEmployees

/**
 * Gets employee CASE ID
 * 
 * @param employee 
 * @returns {String} employee CASE ID
 */
function getCaseId(employee){
  return '';
}

/**
 * TODO
 * Gets employee ADP ID
 * 
 * @param employee 
 * @returns {String} employee ADP ID
 */
function getAdpId(employee){
  return '';
}

/**
 * Gets employee name
 * 
 * @param employee 
 * @returns {String} employee name: First Last (Nick)
 */
function getEmployeeName(employee){
  return '';
}

/**
 * Gets monthly hours for CASE (TODO: how to determine MONTH)
 * 
 * @param employee 
 * @returns {String} monthly hours for full-time CASE employees in MONTH
 */
function getMonthHours(employee){
  return '';
}

/**
 * Gets employee potential hours based on month and
 * work status (eg. part time or full time)
 * 
 * @param employee 
 * @returns {String} employee prorated hours for month
 */
function getEmployeePotentialHours(employee){
  return '';
}

/**
 * Gets employee hours worked
 * 
 * @param employee 
 * @returns {String} employee hours worked
 */
function getEmployeeWorkedHours(employee){
  return '';
}

/**
 * Gets employee hours worked overtime based on
 * potential hours
 * 
 * @param employee 
 * @returns {String} employee hours worked over, floored at 0
 */
function getEmployeeHoursOver(employee){
  return '';
}