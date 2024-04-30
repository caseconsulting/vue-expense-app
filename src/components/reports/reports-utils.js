import _ from 'lodash';

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - employee object
 * @param queryText - query to use to filter
 * @return string - the filtered name
 */
export function customEmployeeFilter(_, queryText, item) {
  item = item.raw;

  const query = queryText ? queryText.trim() : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsEmployeeNumber = item.value.toString().indexOf(query.toString()) >= 0;

  return queryContainsNickName || queryContainsFirstName || queryContainsEmployeeNumber;
} // customEmployeeFilter

/**
 * Returns a filtered list of the input with all inactive
 * employees removed
 */
export function getActive(employees) {
  return _.filter(employees, (e) => {
    return e.workStatus > 0;
  });
} // getActive

/**
 * Gets the full name of an employee.
 *
 * @param item - the employee
 * @return String - The employees first name
 */
export function getFullName(item) {
  item.fullName = item.firstName + ' ' + item.lastName;
  return item.fullName;
} // getFullName

/**
 * Sets a mapping of employee name to employee id for the autocomplete options.
 *
 * @param empData - The list of employees
 */
export function populateEmployeesDropdown(empData) {
  return _.sortBy(
    _.map(empData, (data) => {
      if (data && data.firstName && data.lastName && data.employeeNumber) {
        return {
          text: data.firstName + ' ' + data.lastName,
          value: data.employeeNumber.toString(),
          nickname: data.nickname,
          firstName: data.firstName,
          lastName: data.lastName
        };
      }
    }).filter((data) => {
      return data != null;
    }),
    (employee) => employee.text.toLowerCase()
  );
} // constructAutoComplete

export default {
  customEmployeeFilter,
  getActive,
  getFullName,
  populateEmployeesDropdown
};
