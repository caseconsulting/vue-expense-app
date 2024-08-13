import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _map from 'lodash/map';

/**
 * Returns a filtered list of the input with all inactive
 * employees removed
 */
export function getActive(employees) {
  return _filter(employees, (e) => {
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
  return _sortBy(
    _map(empData, (data) => {
      if (data && data.firstName && (data.nickname || data.lastName) && data.employeeNumber) {
        return {
          text: `${data.nickname || data.firstName} ${data.lastName}`,
          value: data.employeeNumber.toString(),
          id: data.id,
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
  getActive,
  getFullName,
  populateEmployeesDropdown
};
