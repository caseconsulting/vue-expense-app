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
 * @returns Employee object
 */
export function getEmployeeByID(employeeId) {
  return this.$store.getters.employees.find((e) => e.id == employeeId);
} // getEmployeeByID

export default {
  fullName,
  firstAndLastName,
  nicknameAndLastName,
  getEmployeeByID
};
