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
import { getTimesheets } from '@/utils/timesheets.js';
import api from '@/shared/api.js';

/**
 * Global vars
 */
let WORK_HOURS_PER_DAY = 8;

class QuickBooksCsv extends EmployeeCsvUtil {
  /**
   * Fills in employee timesheet information
   */
  async fillTimesheetData(index) {
    // calculateNonbillable if you want all non-billable timecodes, but Dave has requested
    // to only include PTO as non-billable (yes, that means Holiday is considered billable for this)
    let timesheetData = await getTimesheets(this.employees, this.startDate, this.endDate, {
      calculateNonbillable: false
    });
    for (let i in this.employees) {
      let empNum = this.employees[i].employeeNumber;
      if (timesheetData[empNum]) {
        if (!index[empNum]) index[empNum] = {};
        index[empNum] = {
          ...timesheetData[empNum],
          ...index
        };
      }
    }
  }

  /**
   * Fills in data from ADP, namely the ADP ID
   *
   * @param index
   * @param adpInfo - raw ADP info from API call
   */
  fillAdpData(index, adpInfo) {
    // make set of employee numbers from `employees`
    let employeeNums = new Set();
    for (let e of this.employees) employeeNums.add(e.employeeNumber);

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
   * @param index
   * @returns {String} employee CASE ID
   */
  getAdpId(employee, index) {
    return index[employee.employeeNumber]?.adpId || '---';
  }

  /**
   * Calculates and returns the work days between start and end dates provided
   *
   * @param employee
   * @return int - number of remaining working days
   */
  getWorkDays(employee) {
    // allow for employee to be null and just get total workdays in the month
    if (!employee) employee = { hireDate: subtract(getTodaysDate(), 100, 'year', 'YYYY-MM-DD') };

    function isWeekDay(day) {
      return getIsoWeekday(day) >= 1 && getIsoWeekday(day) <= 5;
    }

    let workDays = 0;
    let startDate = format(startOf(this.startDate, 'month'), DEFAULT_ISOFORMAT);
    let endDate = format(endOf(this.endDate, 'month'), DEFAULT_ISOFORMAT);
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
   * @returns {String} monthly hours for full-time CASE employees in MONTH
   */
  getMonthHours() {
    let totalWorkDays = this.getWorkDays(null, startOf(this.startDate, 'month'), endOf(this.startDate, 'month'));
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
  getEmployeePotentialHours(employee, index) {
    // get employee info and yeet if it isn't there
    let n = employee.employeeNumber;
    if (!index[n]) return '---';

    // total work days in the month, hours prorated as a fraction of 100 (aka a percent in decimal form)
    let totalWorkDays = this.getWorkDays(employee, startOf(this.startDate, 'month'), endOf(this.endDate, 'month'));
    let proRatedHours = WORK_HOURS_PER_DAY * (employee.workStatus / 100);

    let result = totalWorkDays * proRatedHours;
    result = result.toFixed(2).replace(/[.,]00$/, '') || null;

    return parseFloat(result);
  }

  /**
   * Gets employee hours worked
   *
   * @param employee
   * @returns {String} employee hours worked
   */
  getEmployeeWorkedHours(employee, index) {
    let n = employee.employeeNumber;
    if (!index[n]) return '---';

    let hours = index[n].billableTimesheet;
    // format
    hours = hours?.toFixed(2)?.replace(/[.,]00$/, '');

    return parseFloat(hours);
  }

  /**
   * Gets employee hours worked overtime based on
   * potential hours
   *
   * @param employee
   * @returns {String} employee hours worked over, floored at 0
   */
  getEmployeeHoursOver(employee, index) {
    let n = employee.employeeNumber;
    if (!index[n]) return '---';

    let hoursOver =
      parseInt(this.getEmployeeWorkedHours(employee, index, this.startDate, this.endDate)) -
      this.getEmployeePotentialHours(employee, index, this.startDate, this.endDate);

    // set min to 0 and format
    hoursOver = Math.max(0, hoursOver);
    hoursOver = hoursOver.toFixed(2).replace(/[.,]00$/, '');

    return parseFloat(hoursOver);
  }

  async createIndex(index) {
    let adpPromise = api.getEmployeesFromAdp(); // run in background while qb runs
    await this.fillTimesheetData(index);
    this.fillAdpData(index, await adpPromise); // fill in ADP response
  } // createIndex

  columns() {
    return [
      {
        title: 'ADP ID',
        getter: this.getAdpId
      },
      {
        title: 'Employee Name',
        getter: this.getEmployeeName
      },
      {
        title: 'Potential Monthly Hours',
        getter: this.getMonthHours
      },
      {
        title: 'Potential Employee Specific Hours',
        getter: this.getEmployeePotentialHours
      },
      {
        title: 'Actual Billable Hours Worked',
        getter: this.getEmployeeWorkedHours
      },
      {
        title: 'Actual Hours Over Potential',
        getter: this.getEmployeeHoursOver
      }
    ];
  }
}
export default QuickBooksCsv;
