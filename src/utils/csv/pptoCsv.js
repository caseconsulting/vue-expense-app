/**
 * Utilities to download EEO reports of employees
 */
import EmployeeCsvUtil from '@/utils/csv/employeeCsvUtil.js';
import { add, format, isBefore, isAfter } from '@/shared/dateUtils.js';

// data for employee PTO export
let earliestDate = '9999-12-31';
let latestDate = '0001-01-01';
class PlannedPtoCsv extends EmployeeCsvUtil {
  /**
   * Adds employee planned PTO columns to an employee's row
   *
   * @param e employee object
   * @param row reference to row to add
   */
  createIndex(plannedPtoIndex) {
    for (let e of this.employees) {
      // extract plan
      let plan = e.plannedPto?.plan;
      if (!plan) continue;

      // update index and earliest/latest date
      plannedPtoIndex[e.employeeNumber] = { total: 0 };
      for (let item of plan) {
        // add to index
        let fDate = format(item.date, null, 'YYYY-MM');
        plannedPtoIndex[e.employeeNumber][fDate] = {
          pto: item.ptoHours,
          holiday: item.holidayHours,
          total: Number(item.ptoHours) + Number(item.holidayHours)
        };
        plannedPtoIndex[e.employeeNumber].total += plannedPtoIndex[e.employeeNumber][fDate].total;
        // update earliest/latest date
        if (isBefore(item.date, earliestDate)) earliestDate = item.date;
        if (isAfter(item.date, latestDate)) latestDate = item.date;
      }
    }
  }

  additionalColumns(plannedPtoIndex, e, rows, i) {
    let curr = earliestDate;
    if (!plannedPtoIndex[e.employeeNumber]) return;
    while (isBefore(curr, latestDate)) {
      // add pto + holiday to row
      rows[i][curr] = plannedPtoIndex[e.employeeNumber]?.[curr]?.total || '-';
      // increment
      curr = add(curr, 1, 'month', 'YYYY-MM');
    }
  } // additionalColumns
}

export default PlannedPtoCsv;
