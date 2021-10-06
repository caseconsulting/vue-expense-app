/**
 * Given an employee returns the employee's full name. Ex. John Jacob Doe
 * @param {JSON} employee - employee object
 * @return Employee name in format First Middle Last
 */
function fullName(employee) {
  const middleName = employee.middleName ? employee.middleName.trim() : '';
  return `${employee.firstName} ${middleName ? middleName + ' ' : ''}${employee.lastName}`;
}

/**
 * Given an employee returns the employee first and last name. Ex. John Jacob Doe -> John Doe
 * @param {JSON} employee - employee object
 * @return Employee name in format First Last
 */
function firstAndLastName(employee) {
  return `${employee.firstName}` + ' ' + `${employee.lastName}`;
}

/**
 * Given an employee returns the employee nickname (when available) and last name
 * @param {JSON} employee - employee object
 * @return Employee nick name in format First Last
 */
function nicknameAndLastName(employee) {
  let firstName = employee.nickname ? employee.nickname : employee.firstName;
  return `${firstName}` + ' ' + `${employee.lastName}`;
}

export default {
  fullName,
  firstAndLastName,
  nicknameAndLastName
};
