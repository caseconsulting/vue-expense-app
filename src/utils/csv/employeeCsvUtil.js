import CsvUtil from '@/utils/csv/csvUtil.js';
class EmployeeCsvUtil extends CsvUtil {
  /**
   * Get attribute of a data set
   *
   * @param dataSet
   * @param attribute
   * @returns attribute value
   */
  static getAttribute(dataSet, attribute) {
    return dataSet[attribute];
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
 static async convertEmployees(employees, options) {
  // columns and their getter functions
  let columns = [
    {
      title: 'CASE ID',
      attribute: 'employeeNumber',
    }
  ].concat(this.columns());

  let index;
  if (this.createIndex) {
    index = {};
    await this.createIndex(index, employees, options.startDate, options.endDate);
  }

  // build out one row per employee
  let rows = [];
  let i = 0;
  for (let e of employees) {
    if (index && !index[e.employeeNumber]) continue;
    let row = {};
    let clearances, contracts;
    // add in pre-defined columns
    for (let col of columns) {
      if (col.attribute) {
        row[col.title] = this.getAttribute(e, col.attribute);
      } else if (col.date) {
        row[col.title] = this.getDate(e, col.date);
      } else if (col.phone) {
        row[col.title] = this.getPhoneNumbers(e, col.phone);
      } else if (col.clearance) {
        if (!clearances) {
          clearances = this.getClearancesData(e.clearances);
        }
        row[col.title] = this.getAttribute(clearances, col.clearance);
      } else if (col.contract) {
        if (!contracts) {
          contracts = this.getContractsInfo(e, options.preloaded.contracts);
        }
        row[col.title] = this.getAttribute(contracts, col.contract);
      } else if (col.tags) {
        row[col.title] = this.getTags(e, options.preloaded.tags);
      } else {
        row[col.title] = col.getter.bind(this)(e, index, options.startDate, options.endDate);
      }
    }
    // add employee row
    rows.push(row);
    // add in planned PTO columns
    if (this.additionalColumns) {
      this.additionalColumns(index, e, rows, i);
    }
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
 static async download(employees, options = {}) {
    options = {
      filename: 'Employee Report',
      startDate: null,
      endDate: null,
      preloaded: null,
      ...options
    }
    let convertedEmployees = await this.convertEmployees(employees, options);
    let csvFileString = super.generate(convertedEmployees); // convert to csv file string
    super.download(csvFileString, options.filename); // download csv file string as .csv
  } // download

}
export default EmployeeCsvUtil;