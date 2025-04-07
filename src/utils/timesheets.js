import api from '@/shared/api.js';

const BATCH_SIZE = 50; // batch size for QB API parallel calls

let SUPP_DATA = {
  nonBillables: new Set(['PTO'])
};

export async function getTimesheets(employees, startDate, endDate, options) {
  options = {
    calculateNonbillable: true,
    ...options
  };
  let timesheetsByEmployeeNumber = {};
  // run API calls for each employee first (for easy batching)
  let batch = [];
  let batchEmployees = []; // employee numbers, in same order as batch[]
  let promise, resps, resp, employeeNumber;
  for (let i in employees) {
    // build promises
    promise = api.getTimesheetsData(employees[i].employeeNumber, {
      periods: { startDate, endDate },
      employeeId: employees[i].id
    });
    batch.push(promise);
    batchEmployees.push(employees[i].employeeNumber);

    // run promises and fill data
    if (batch.length == BATCH_SIZE || i == employees.length - 1) {
      resps = await Promise.all(batch);

      for (let k in resps) {
        // get response and map to employee
        resp = resps[k].timesheets?.[0]?.timesheets;
        employeeNumber = batchEmployees[k];
        if (!resp) continue;
        if (options.calculateNonbillable) {
          // add any non-billables we don't have
          resps[k].supplementalData.nonBillables.forEach((code) => {
            SUPP_DATA.nonBillables.add(code);
          });
        }

        if (!timesheetsByEmployeeNumber[employeeNumber])
          timesheetsByEmployeeNumber[employeeNumber] = { employeeNumber };
        timesheetsByEmployeeNumber[employeeNumber].timesheets = resp;
        timesheetsByEmployeeNumber[employeeNumber].billableTimesheet = getBillableHours(
          resp,
          options.calculateNonbillable
        );
      }
      // clear batches
      batch = [];
      batchEmployees = [];
    }
  }

  return timesheetsByEmployeeNumber;
}

/**
 * Gets billable hours
 *
 * @param timesheetData
 * @returns {Number} billable hours in timesheetData
 */
function getBillableHours(timesheetData, calculateNonbillable) {
  let nonBillables;
  if (calculateNonbillable) {
    nonBillables = SUPP_DATA.nonBillables;
  } else {
    nonBillables = new Set(['PTO']);
  }

  // tally up hours
  let total = 0;
  for (let jobcode in timesheetData) {
    if (!nonBillables.has(jobcode)) {
      total += timesheetData[jobcode] / 3600; // seconds to hours
    }
  }

  return total;
}
