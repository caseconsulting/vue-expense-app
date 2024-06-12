/**
 * Given an employee returns the employee's full name. Ex. John Jacob Doe
 * @param {JSON} employee - employee object
 * @return Employee name in format First Middle Last
 */
export function fullName(employee) {
  const middleName = employee.middleName ? employee.middleName.trim() : '';
  return `${employee.firstName} ${middleName ? middleName + ' ' : ''}${employee.lastName}`;
} // fullName

/**
 * Given an employee returns the employee first and last name. Ex. John Jacob Doe -> John Doe
 * @param {JSON} employee - employee object
 * @return Employee name in format First Last
 */
export function firstAndLastName(employee) {
  return `${employee.firstName}` + ' ' + `${employee.lastName}`;
} // firstAndLastName

/**
 * Given an employee returns the employee nickname (when available) and last name
 * @param {JSON} employee - employee object
 * @return Employee nick name in format First Last
 */
export function nicknameAndLastName(employee) {
  let firstName = employee.nickname ? employee.nickname : employee.firstName;
  return `${firstName}` + ' ' + `${employee.lastName}`;
} // nicknameAndLastName

/**
 * Gets an employee object based on the employee ID parameter
 * @param {Number} employeeId - employee ID
 * @param {Array} employees - list of employees
 * @returns Employee object
 */
export function getEmployeeByID(employeeId, employees) {
  return employees.find((e) => e.id == employeeId);
} // getEmployeeByID

/**
 * Returns an array of employees current contracts
 *
 * @param employeeId - employee ID to find contracts for
 * @param employees - list of employees
 * @return array of contract objects
 */
export function getEmployeeCurrentContracts(employeeId, employees) {
  let currentContracts = [];
  // for some reason `employees.find()` is undefined
  let contracts = [];
  for (let e of employees) {
    if (e.id === employeeId) {
      contracts = e.contracts;
      break;
    }
  }
  // add any contract that has a current project
  for (let c of contracts ?? []) {
    for (let p of c.projects) {
      if (!p.endDate) {
        currentContracts.push(c);
        break;
      }
    }
  }
  return currentContracts;
}

/**
 * Returns an array of employees current projects
 *
 *
 * @param employeeId - employee ID to find projects for
 * @param employees - list of employees
 * @return array of contract objects
 */
export function getEmployeeCurrentProjects(employeeId, employees) {
  let currentProjects = [];
  // for some reason `employees.find()` is undefined
  let contracts = [];
  for (let e of employees) {
    if (e.id === employeeId) {
      contracts = e.contracts;
      break;
    }
  }
  // add any projects that are current
  for (let c of contracts ?? []) for (let p of c.projects) if (!p.endDate) currentProjects.push(p);
  // return :)
  return currentProjects;
}

export default {
  fullName,
  firstAndLastName,
  nicknameAndLastName,
  getEmployeeByID,
  getEmployeeCurrentContracts,
  getEmployeeCurrentProjects
};
