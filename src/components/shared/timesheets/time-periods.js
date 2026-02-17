import _find from 'lodash/find';
import _forEach from 'lodash/forEach';
import _cloneDeep from 'lodash/cloneDeep';
import store from '../../../../store/index.js';
import {
  add,
  subtract,
  isBefore,
  isSame,
  format,
  getTodaysDate,
  getYear,
  setYear,
  startOf,
  endOf,
  DEFAULT_ISOFORMAT
} from '../../../shared/dateUtils';
import { getEmployeeCurrentContracts, getEmployeeCurrentProjects } from '@/shared/employeeUtils.js';

/**
 * Gets the calendar year period.
 *
 * @returns Object - The calendar year period for timesheet collection
 */
export function getYearsInMonths() {
  let periods = [];

  let today = getTodaysDate();
  let date = startOf(subtract(today, 1, 'year'), 'year'); // jan of last year
  while (isBefore(date, today, 'day')) {
    let displayFormat = isSame(date, today, 'year') ? 'MMMM' : 'MMM \'YY';
    periods.push({
      startDate: format(startOf(date, 'month'), null, DEFAULT_ISOFORMAT),
      endDate: format(endOf(date, 'month'), null, DEFAULT_ISOFORMAT),
      title: format(date, null, displayFormat)
    });
    date = format(add(date, 1, 'month'), null, 'YYYY-MM-DD');
  }

  return periods;
} // getCalendarYearPeriods

/**
 * Gets the calendar year period.
 *
 * @returns Object - The calendar year period for timesheet collection
 */
export function getCalendarYearPeriods() {
  let today = getTodaysDate();
  let currentYear = {
    startDate: format(startOf(today, 'year'), null, DEFAULT_ISOFORMAT),
    endDate: format(endOf(today, 'year'), null, DEFAULT_ISOFORMAT),
    title: format(today, null, 'YYYY')
  };
  let lastYearToday = subtract(today, 1, 'year');
  let previousYear = {
    startDate: format(startOf(lastYearToday, 'year'), null, DEFAULT_ISOFORMAT),
    endDate: format(endOf(lastYearToday, 'year'), null, DEFAULT_ISOFORMAT),
    title: format(lastYearToday, null, 'YYYY')
  };
  return [previousYear, currentYear];
} // getCalendarYearPeriods

/**
 * Gets the contract year period based on settings set on the Contracts page. For more info
 * on the cases, go to modals/ContractSettingsModal.vue and look at timesheetsContractViewOptions.
 *
 * @param {Object} employee - The employee to get the contract year period from
 * @returns Object - The contract year period for timesheet collection
 */
export function getContractYearPeriods(employee) {
  let period = null;
  let curContract = getEmployeeCurrentContracts(employee)?.[0];
  let contract = _find(store.getters.contracts, (c) => c.id === curContract?.contractId);
  switch (contract.settings?.timesheetsContractViewOption) {
    case '0':
      period = _getContractCurrentProjectPeriod(employee);
      break;
    case '1':
      period = _getContractPoPStartPeriod(contract);
      break;
    case '2':
      period = _getContractProjectPeriod(contract, employee);
      break;
    default:
  }
  return period;
} // getContractYearPeriods

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
////////////////////////////// HELPERS //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

/**
 * Gets the current contract project period for an employee.
 *
 * @param {Object} employee - The employee to get the contract year period from
 * @returns Object - The time period
 */
function _getContractCurrentProjectPeriod(employee) {
  let project = getEmployeeCurrentProjects(employee)?.[0];
  if (!project) return null;
  return _getYearPeriod(project.startDate);
} // _getContractCurrentProjectPeriod

/**
 * Gets the current contract PoP period for an employee.
 *
 * @param {Object} contract - The contract object that the employee is currently on
 * @returns Object - The time period
 */
function _getContractPoPStartPeriod(contract) {
  return _getYearPeriod(contract.popStartDate, contract.popEndDate);
} // _getContractPoPStartPeriod

/**
 * Gets the current project PoP based on contract's project's dates (not the employee profile)
 *
 * @param contract The contrcat object that the employee is currently on
 */
function _getContractProjectPeriod(contract, employee) {
  let employeeProjectId = getEmployeeCurrentProjects(employee)?.[0]?.projectId;
  let contractProject = _find(contract.projects, (p) => p.id == employeeProjectId);
  if (contractProject) return _getYearPeriod(contractProject.popStartDate, contractProject.popEndDate);
}

/**
 * Gets a year long period based on the start date and today's date. Today's date will fall between the time period.
 *
 * @param {String} sDate - The start date
 * @param {String} eDate - End Date: if provided, this function just formats the sDate and eDate into an object
 * @returns The year long period
 */
function _getYearPeriod(sDate, eDate) {
  let today = getTodaysDate();
  let currentYear = getYear(today);

  // format start date
  let startDate = format(sDate, null, DEFAULT_ISOFORMAT);
  if (!startDate) startDate = startOf(today, 'year');
  if (!eDate) {
    // if there is both a start and end date provided, use them verbatim
    startDate = setYear(startDate, currentYear);
    if (isBefore(today, startDate, 'day')) startDate = setYear(startDate, currentYear - 1);
  }

  // calculate end date
  let endDate;
  if (eDate) {
    endDate = format(eDate, null, DEFAULT_ISOFORMAT);
  } else {
    endDate = format(add(startDate, 1, 'year'), null, DEFAULT_ISOFORMAT);
    endDate = format(subtract(endDate, 1, 'day'), null, DEFAULT_ISOFORMAT);
  }

  // make titles
  let startDateTitle = format(startDate, null, 'MMM D, YYYY');
  let endDateTitle = format(endDate, null, 'MMM D, YYYY');

  // return object
  return { startDate, endDate, title: `${startDateTitle} - ${endDateTitle}` };
} // _getYearPeriod

export default {
  getCalendarYearPeriods,
  getContractYearPeriods
};
