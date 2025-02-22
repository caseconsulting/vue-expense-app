/**
 * Utilities to download EEO reports of employees
 */
import EmployeeCsvUtil from '@/utils/csv/employeeCsvUtil.js';
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
let SUPP_DATA = {
  nonBillables: new Set(['PTO'])
};
let BATCH_SIZE = 50; // batch size for QB API parallel calls
let WORK_HOURS_PER_DAY = 8;

class QuickBooksCsv extends EmployeeCsvUtil {
  /**
   * Fills in employee timesheet information
   *
   * @param employees list of employees to get data for
   * @param startDate YYYY-MM-DD to get timsheet data from
   * @param endDate YYYY-MM-DD to get timesheet data until
   */
  static async fillTimesheetData(employees, startDate, endDate) {
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

        // parse responses
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
          if (!index[empNum]) index[empNum] = {};
          index[empNum]['timesheets'] = resp;
        }
        // clear batches
        batch = [];
        batch_employees = [];
      }
    }
  }

  /**
   * Fills in data from ADP, namely the ADP ID
   *
   * @param employees - employees to look for
   * @param adpInfo - raw ADP info from API call
   */
  static fillAdpData(employees, index, adpInfo) {
    // make set of employee numbers from `employees`
    let employeeNums = new Set();
    for (let e of employees) employeeNums.add(e.employeeNumber);

    // fill in info from ADP
    let empNum, adpId;
    for (let e of adpInfo) {
      empNum = e?.customFieldGroup?.stringFields[0]?.stringValue;
      if (!empNum) continue; // skip if employee num wasn't found in adpInfo
      // fill in data
      if (!index[empNum]) index[empNum] = {};
      adpId = e.workAssignments[0]?.payrollFileNumber;
      if (adpId) adpId = Number(adpId); // remove leading 0s
      index[empNum]['adpId'] = adpId;
    }
  }

  /**
   * Gets employee ADP ID, based on index
   *
   * @param employee
   * @returns {String} employee CASE ID
   */
  static getAdpId(employee, index) {
    return index[employee.employeeNumber]?.adpId || '---';
  }

  /**
   * Calculates and returns the work days between start and end dates provided
   *
   * @param {String} startDate - The start date (in YYYY-MM-DD format)
   * @param {String} endDate - The end date (in YYYY-MM-DD format)
   * @param {Boolean} excludeProRated - Whether or not to pro-rate based on hire date (default is to pro-rate)
   * @return int - number of remaining working days
   */
  static getWorkDays(employee, startDate, endDate) {
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
  static getMonthHours(employee, index, startDate) {
    let totalWorkDays = this.getWorkDays(null, startOf(startDate, 'month'), endOf(startDate, 'month'));
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
  static getEmployeePotentialHours(employee, index, startDate, endDate) {
    // get employee info and yeet if it isn't there
    let n = employee.employeeNumber;
    if (!index[n]) return '---';

    // total work days in the month, hours prorated as a fraction of 100 (aka a percent in decimal form)
    let totalWorkDays = this.getWorkDays(employee, startOf(startDate, 'month'), endOf(endDate, 'month'));
    let proRatedHours = WORK_HOURS_PER_DAY * (employee.workStatus / 100);

    let result = totalWorkDays * proRatedHours;
    result = result.toFixed(2).replace(/[.,]00$/, '') || null;

    return result;
  }

  /**
   * Gets employee hours worked
   *
   * @param employee
   * @returns {String} employee hours worked
   */
  static getEmployeeWorkedHours(employee, index) {
    let n = employee.employeeNumber;
    if (!index[n]) return '---';
    let timesheets = index[n].timesheets;

    // use SUPP_DATA.nonBillables if you want all non-billable timecodes, but Dave has requested
    // to only include PTO as non-billable (yes, that means Holiday is considered billable for this)
    let nonBillables = new Set(['PTO']);

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
  static getEmployeeHoursOver(employee, index, startDate, endDate) {
    let n = employee.employeeNumber;
    if (!index[n]) return '---';

    let hoursOver =
      this.getEmployeeWorkedHours(employee, index, startDate, endDate) -
      this.getEmployeePotentialHours(employee, index, startDate, endDate);

    // set min to 0 and format
    hoursOver = Math.max(0, hoursOver);
    hoursOver = hoursOver.toFixed(2).replace(/[.,]00$/, '') || null;

    return hoursOver;
  }

  static async createIndex(index, employees, startDate, endDate) {
    let adpPromise = api.getEmployeesFromAdp(); // run in background while qb runs
    await this.fillTimesheetData(employees, startDate, endDate);
    this.fillAdpData(employees, index, await adpPromise); // fill in ADP response
  } // createIndex

  static columns() {
    return [
      {
        title: 'ADP ID',
        getter: this.getAdpId,
      },
      {
        title: 'Employee Name',
        getter: this.getEmployeeName,
      },
      {
        title: 'Potential Monthly Hours',
        getter: this.getMonthHours,
      },
      {
        title: 'Potential Employee Specific Hours',
        getter: this.getEmployeePotentialHours,
      },
      {
        title: 'Actual Billable Hours Worked',
        getter: this.getEmployeeWorkedHours,
      },
      {
        title: 'Actual Hours Over Potential',
        getter: this.getEmployeeHoursOver,
      }
    ];
  }
}
export default QuickBooksCsv;
