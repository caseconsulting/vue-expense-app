import _forEach from 'lodash/forEach';
import store from '../../store/index';
import { isAfter, getTodaysDate } from '@/shared/dateUtils';

/**
 * Gets a list of orgs from a sepcific level from all contracts/projects.
 * Example: field = 'directorate' orgs = {directorate: 'Mission Center', org2: 'LEM'}
 * This will return all directorate orgs from contracts and projects that also contain directorate = 'Mission Center' AND org2 = 'LEM'
 *
 * @param {String} field - The org level (directorate, org2, or org3)
 * * @param {Object} orgs - The orgs (directorate, org2, org3) this should NOT include what is in 'field' param
 * @returns Array - The list of orgs from 'field' level
 */
export function getOrgList(field, orgs) {
  const { directorate, org2, org3 } = orgs || {};
  let set = new Set();
  _forEach(store.getters.contracts, (c) => {
    if ((!directorate || directorate === c.directorate) && (!org2 || org2 === c.org2) && (!org3 || org3 === c.org3))
      if (c[field]) set.add(c[field]);
    _forEach(c.projects, (p) => {
      if ((!directorate || directorate === p.directorate) && (!org2 || org2 === p.org2) && (!org3 || org3 === p.org3))
        if (p[field]) set.add(p[field]);
    });
  });
  return Array.from(set);
} // getOrgList

/**
 * Gets all project locations.
 *
 * @returns Array - The list of unique project locations
 */
export function getProjectLocations() {
  let set = new Set();
  _forEach(store.getters.contracts, (c) => {
    _forEach(c.projects, (p) => {
      if (p.location) set.add(p.location);
    });
  });
  return Array.from(set);
} // getProjectLocations

/**
 * Gets the projects current employees in the form of a list.
 *
 * @param {JSON} contract - contract object pertaining to project
 * @param {JSON} project - project object
 * @param {Array} employees - list of employees
 * @return list of passed employees
 */
export function getProjectCurrentEmployees(contract, project, employees) {
  let employeesList = [];

  // loop through every employee's projects
  for (let employee of employees) {
    if (employee.workStatus === 0) continue;
    for (let c of employee.contracts ?? []) {
      if (contract.id != c.contractId) continue; // skip non-matching contracts
      for (let p of c.projects ?? []) {
        if (project.id != p.projectId) continue; // skip non-matching projects
        if (isProjectActive(project, employee)) employeesList.push(employee);
      }
    }
  }

  return employeesList;
} // getProjectCurrentEmployees

/**
 * Gets past employees who were assigned to project.
 *
 * @param {JSON} contract - contract object pertaining to project
 * @param {JSON} project - project object
 * @param {Array} employees - list of employees
 * @return list of current employees
 */
export function getProjectPastEmployees(contract, project, employees) {
  let employeesList = [];
  
  for (let employee of employees) {
    for (let c of employee.contracts ?? []) {
      if (contract.id != c.contractId) continue; // skip non-matching contracts
      for (let p of c.projects ?? []) {
        if (project.id != p.projectId) continue; // skip non-matching projects
        if (!isProjectActive(project, employee)) employeesList.push(employee);
      }
    }
  }

  return employeesList;
} // getProjectPastEmployees

/**
 * Gets project based on conractId and projecId
 *
 * @param {String} contractId id of contract
 * @param {String} projectId id of project
 * @param {Array} contracts list of contracts
 *
 * @return Project object
 */
export function getProject(contractId, projectId, contracts) {
  return contracts.find((c) => c.id == contractId).projects.find((p) => p.id == projectId);
} // getProject

/**
 * Returns true if the project is active for a given employee. Note that this
 * ignores the project dates and only checks if the employee object's project.
 * 
 * @param project - the project to check
 * @param employee - the employee to check
 * @returns boolean - if the project is active
 */
export function isProjectActive(project, employee) {
  // check if the employee is active on the project
  for (let c of employee.contracts ?? [])
    for (let p of c.projects ?? [])
      if (p.projectId === project.id) {
        if (employee.workStatus === 0) return false; // employee is inactive
        if (p.presentDate != null) return p.presentDate; // presentDate exists
        return p.endDate; // presentDate doesn't exist, default to old date method
      }
} // isProjectActive

export default {
  getOrgList,
  getProjectCurrentEmployees,
  getProjectPastEmployees,
  getProject,
  isProjectActive
};
