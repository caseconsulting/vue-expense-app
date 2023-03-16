import _ from 'lodash';

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
    if (employee.contracts) {
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
export function getProjectPassedEmployees(contract, project, employees) {
  let employeesList = [];
  _.forEach(employees, (employee) => {
    if (employee.contracts) {
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
} // getProjectPassedEmployees

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
  getProjectCurrentEmployees,
  getProjectPassedEmployees,
  getProject
};
