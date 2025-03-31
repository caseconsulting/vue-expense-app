import _find from 'lodash/find';
import _forEach from 'lodash/forEach';
import _cloneDeep from 'lodash/cloneDeep';
import store from '../../../../store/index.js';
import {
  add,
  subtract,
  isBefore,
  format,
  getTodaysDate,
  getYear,
  setYear,
  startOf,
  endOf,
  DEFAULT_ISOFORMAT
} from '../../../shared/dateUtils';

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
  let curContract = _find(employee.contracts, (c) => _find(c.projects, (p) => !p.endDate));
  let contract = _find(store.getters.contracts, (c) => c.id === curContract?.contractId);
  switch (contract.settings?.timesheetsContractViewOption) {
    case '0':
      period = _getContractCurrentProjectPeriod(employee);
      break;
    case '1':
      period = _getContractPoPStartPeriod(contract);
      break;
    case '2':
      period = _getContractProjectPeriod(contract);
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
  let project = _getEmployeeCurrentProject(employee);
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
  return _getYearPeriod(contract.popStartDate);
} // _getContractPoPStartPeriod

/**
 * Gets the current project PoP based on contract's project's dates (not the employee profile)
 *
 * @param contract The contrcat object that the employee is currently on
 */
function _getContractProjectPeriod(contract, employee) {
  let currentProject = null;
  for (let contract of employee.contracts || {}) {
    let project = _find(contract.projects, (p) => !p.endDate);
    if (project) currentProject = _cloneDeep(project);
  }
  if (currentProject) return _getYearPeriod(project.startDate);
}

/**
 * Gets a year long period based on the start date and today's date. Today's date will fall between the time period.
 *
 * @param {String} sDate - The start date
 * @returns The year long period
 */
function _getYearPeriod(sDate) {
  let today = getTodaysDate();
  let currentYear = getYear(today);
  let startDate = format(sDate, null, DEFAULT_ISOFORMAT);
  startDate = setYear(startDate, currentYear);
  if (isBefore(today, startDate, 'day')) startDate = setYear(startDate, currentYear - 1);
  let endDate = format(add(startDate, 1, 'year'), null, DEFAULT_ISOFORMAT);
  endDate = format(subtract(endDate, 1, 'day'), null, DEFAULT_ISOFORMAT);
  let startDateTitle = format(startDate, null, 'MMM D, YYYY');
  let endDateTitle = format(endDate, null, 'MMM D, YYYY');
  return { startDate, endDate, title: `${startDateTitle} - ${endDateTitle}` };
} // _getYearPeriod

/**
 * Gets the current project that is toggled to show for contract year.
 *
 * @param {Object} employee - The employee object
 * @returns Object - The current project to show
 */
function _getEmployeeCurrentProject(employee) {
  let currentProject = null;
  _forEach(employee.contracts, (c) => {
    let project = _find(c.projects, (p) => !p.endDate);
    if (project) currentProject = _cloneDeep(project);
  });
  return currentProject;
} // _getEmployeeCurrentProject

export default {
  getCalendarYearPeriods,
  getContractYearPeriods
};
