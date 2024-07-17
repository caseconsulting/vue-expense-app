import _ from 'lodash';
import store from '../../store/index';

/**
 * Gets contract names available based on if primes or projects are entered.
 *
 * @param contract - A user's contract data
 * @return Array - An array of contract names
 */
function getContractsDropdownItems(contract) {
  let contracts = store.getters.contracts;
  if (!contract) {
    return [];
  } else if (contract.primeName && contract.projects.length == 1 && _.isEmpty(contract.projects[0].projectName)) {
    // only prime name is filled out
    let matchedContracts = contracts.filter((c) => c.primeName === contract.primeName);
    return matchedContracts.map((c) => c.contractName);
  } else if (contract.primeName) {
    // prime name and project names are filled out
    let project = contract.projects[0];
    let matchedContracts = contracts.filter(
      (c) => c.primeName === contract.primeName && c.projects.some((p) => p.projectName === project.projectName)
    );
    return matchedContracts.map((c) => c.contractName);
  } else if (_.isEmpty(contract.primeName) && !_.isEmpty(contract.projects[0].projectName)) {
    // only project names are filled out
    let project = contract.projects[0];
    let matchedContracts = store.contracts.filter((c) => c.projects.some((p) => p.projectName === project.projectName));
    return matchedContracts.map((c) => c.contractName);
  } else {
    // prime and projects fields are empty
    return contracts.map((c) => c.contractName);
  }
} // getContractsDropdownItems

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
  _.forEach(employees, (employee) => {
    if (employee.contracts && employee.workStatus > 0) {
      if (
        employee.contracts.some(
          (c) => contract.id == c.contractId && c.projects.some((p) => p.projectId == project.id && !p.endDate)
        )
      ) {
        employeesList.push(employee);
      }
    }
  });
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
  _.forEach(employees, (employee) => {
    if (employee.contracts && employee.workStatus > 0) {
      if (
        employee.contracts.some(
          (c) => contract.id == c.contractId && c.projects.some((p) => p.projectId == project.id && !p.presentDate)
        )
      ) {
        employeesList.push(employee);
      }
    }
  });
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

export default {
  getContractsDropdownItems,
  getProjectCurrentEmployees,
  getProjectPastEmployees,
  getProject
};
