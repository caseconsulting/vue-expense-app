/**
 * Utilities to download EEO reports of employees
 */
import EmployeeCsvUtil from '@/utils/csv/employeeCsvUtil.js';
import { add, format, isBefore, isAfter } from '@/shared/dateUtils.js';

// data for employee PTO export
let earliestDate = '9999-12-31';
let latestDate = '0001-01-01';
class PlannedPTOCSV extends EmployeeCsvUtil {

  /**
   * Converts employees to an array of objects to pass in to csvUtils.generate(). Expects
   * an array of employees.
   * @param employees - expense object to convert
   * @return a new object passable to csv.js
   */
  static async convertEmployees(employees) {
    // columns and their getter functions
    let cols = [
      {
        title: 'CASE ID',
        getter: this.getCaseId,
      },
      {
        title: 'Employee Name',
        getter: this.getEmployeeName,
      }
    ];

    // build index of employee PTO/Holiday plan for addPlannedPtoColumns to use
    let plannedPtoIndex = {};
    this.indexPlannedPto(employees, plannedPtoIndex);

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
      this.addPlannedPtoColumns(e, rows, i, plannedPtoIndex);
      i++;
    }

    // sort by employee number, ascending
    rows.sort((a, b) => {
      return a['CASE ID'] > b['CASE ID'];
    });

    return rows;
  } // convertEmployees

  /**
   * Adds employee planned PTO columns to an employee's row
   *
   * @param e employee object
   * @param row reference to row to add
   */
  static indexPlannedPto(employees, plannedPtoIndex) {
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

  static addPlannedPtoColumns(e, rows, i, plannedPtoIndex) {
    let curr = earliestDate;
    if (!plannedPtoIndex[e.id]) return;
    while (isBefore(curr, latestDate)) {
      // add pto + holiday to row
      rows[i][curr] = plannedPtoIndex[e.id]?.[curr]?.total || '-';
      // increment
      curr = add(curr, 1, 'month', 'YYYY-MM');
    }
  }
}

export default PlannedPTOCSV;
