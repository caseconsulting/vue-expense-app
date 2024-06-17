import _ from 'lodash';
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
export function getCalendarYearPeriod() {
  let today = getTodaysDate();
  let startDate = format(startOf(today, 'year'), null, DEFAULT_ISOFORMAT);
  let endDate = format(endOf(today, 'year'), null, DEFAULT_ISOFORMAT);
  let title = format(startDate, null, 'YYYY');
  return { startDate, endDate, title };
} // getCalendarYearPeriod

/**
 * Gets the contract year period based on settings set on the Contracts page. For more info
 * on the cases, go to modals/ContractSettingsModal.vue and look at timesheetsContractViewOptions.
 *
 * @param {Object} employee - The employee to get the contract year period from
 * @returns Object - The contract year period for timesheet collection
 */
export function getContractYearPeriod(employee) {
  let period = null;
  let curContract = _.find(employee.contracts, (c) => _.find(c.projects, (p) => !p.endDate));
  let contract = _.find(store.getters.contracts, (c) => c.id === curContract?.contractId);
  switch (contract.settings?.timesheetsContractViewOption) {
    case '0':
      period = _getContractCurrentProjectPeriod(employee);
      break;
    case '1':
      period = _getContractPoPStartPeriod(contract);
      break;
    default:
  }
  return period;
} // getContractYearPeriod

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
  let project = _getCurrentProject(employee);
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
function _getCurrentProject(employee) {
  let currentProject = null;
  _.forEach(employee.contracts, (c) => {
    let project = _.find(c.projects, (p) => !p.endDate);
    if (project) currentProject = _.cloneDeep(project);
  });
  return currentProject;
} // _getCurrentProject

export default {
  getCalendarYearPeriod,
  getContractYearPeriod
};
