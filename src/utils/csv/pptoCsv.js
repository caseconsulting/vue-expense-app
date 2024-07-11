/**
 * Utilities to download EEO reports of employees
 */
import csvUtils from './baseCsv.js';
import { add, format, isBefore, isAfter } from '@/shared/dateUtils.js';

// data for employee PTO export
let earliestDate = '9999-12-31';
let latestDate = '0001-01-01';
let plannedPtoIndex = {};

/**
 * Downloads array of employees EEO information as csv file.
 * @param employees - array of employees objects
 */
export async function download(employees, options = { filename: null }) {
  let convertedEmployees = await convertEmployees(employees); // convert employees into csv object (returns two arrays)
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
export async function convertEmployees(employees) {
  // columns and their getter functions
  let cols = [
    {
      title: 'CASE ID',
      getter: getCaseId
    },
    {
      title: 'Employee Name',
      getter: getEmployeeName
    }
  ];

  // build index of employee PTO/Holiday plan for addPlannedPtoColumns to use
  indexPlannedPto(employees);

  // build out one row per employee
  let rows = [];
  let i = 0;
  for (let e of employees) {
    if (!plannedPtoIndex[e.id]?.total) continue;
    let row = {};
    // add in pre-defined columns
    for (let col of cols) row[col.title] = col.getter(e);
    // add employee row
    rows.push(row);
    // add in planned PTO columns
    addPlannedPtoColumns(e, rows, i);
    i++;
  }

  // sort by employee number, ascending
  rows.sort((a, b) => {
    return a['CASE ID'] > b['CASE ID'];
  });

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
 * Adds employee planned PTO columns to an employee's row
 *
 * @param e employee object
 * @param row reference to row to add
 */
function indexPlannedPto(employees) {
  for (let e of employees) {
    // extract plan
    let plan = e.plannedPto?.plan;
    if (!plan) continue;

    // update index and earliest/latest date
    plannedPtoIndex[e.id] = { total: 0 };
    for (let item of plan) {
      // add to index
      let fDate = format(item.date, null, 'YYYY-MM');
      plannedPtoIndex[e.id][fDate] = {
        pto: item.ptoHours,
        holiday: item.holidayHours,
        total: Number(item.ptoHours) + Number(item.holidayHours)
      };
      plannedPtoIndex[e.id].total += plannedPtoIndex[e.id][fDate].total;
      // update earliest/latest date
      if (isBefore(item.date, earliestDate)) earliestDate = item.date;
      if (isAfter(item.date, latestDate)) latestDate = item.date;
    }
  }
}

function addPlannedPtoColumns(e, rows, i) {
  let curr = earliestDate;
  if (!plannedPtoIndex[e.id]) return;
  while (isBefore(curr, latestDate)) {
    // add pto + holiday to row
    rows[i][curr] = plannedPtoIndex[e.id]?.[curr]?.total || '-';
    // increment
    curr = add(curr, 1, 'month', 'YYYY-MM');
  }
}

export default {
  download,
  convertEmployees
};
