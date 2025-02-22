import CsvUtil from '@/utils/csv/csvUtil.js';
class EmployeeCsvUtil extends CsvUtil {
  /**
   * Gets employee CASE ID
   *
   * @param employee
   * @returns {String} employee CASE ID
   */
  static getCaseId(employee) {
    return employee.employeeNumber;
  }

  /**
   * Gets employee name
   *
   * @param employee
   * @returns {String} employee name: First Last (Nick)
   */
  static getEmployeeName(employee) {
    // get first and last name, append nickname if it exists
    let name = `${employee.lastName}, ${employee.firstName}`;
    if (employee.nickname) name += ` (${employee.nickname})`;

    return name;
  }

  /**
 * Converts employees to an array of objects to pass in to csvUtils.generate(). Expects
 * an array of employees.
 * @param employees - expense object to convert
 * @return a new object passable to csv.js
 */
 static async convertEmployees(employees) {
  // columns and their getter functions
  let cols = [
    {
      title: 'CASE ID',
      getter: this.getCaseId,
    },
    {
      title: 'Employee Name',
      getter: this.getEmployeeName,
    }
  ];

  // build out one row per employee
  let rows = [];
  let i = 0;
  for (let e of employees) {
    let row = {};
    // add in pre-defined columns
    for (let col of cols) row[col.title] = col.getter(e);
    // add employee row
    rows.push(row);
    // add in planned PTO columns
    addAdditionalColumns(e, rows, i);
    i++;
  }

  // sort by employee number, ascending
  rows.sort((a, b) => {
    return a['CASE ID'] > b['CASE ID'];
  });

  return rows;
} // convertEmployees

 /**
   * Downloads array of employees EEO information as csv file.
   * @param employees - array of employees objects
   */
 static async download(employees, options = { filename: null }) {
    let convertedEmployees = await this.convertEmployees(employees); // convert employees into csv object (returns two arrays)
    let csvFileString = super.generate(convertedEmployees); // convert to csv file string
    if (!options.filename) options.filename = 'Employee Report';
    super.download(csvFileString, options.filename); // download csv file string as .csv
  } // download

}
export default EmployeeCsvUtil;