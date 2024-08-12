/**
 * Utilities to convert expense objects into objects passable to
 * csv.js
 */
import _forEach from 'lodash/forEach';
import _cloneDeep from 'lodash/cloneDeep';
import _find from 'lodash/find';
import store from '../../../store/index.js';
import { format, DEFAULT_ISOFORMAT } from '../../shared/dateUtils';
import csvUtils from './baseCsv.js';

/**
 * Downloads array of expenses as csv file.
 * @param expenses - array of expense objects
 */
export function download(expenses) {
  let filename = Array.isArray(expenses) ? 'expenses.csv' : 'expense.csv';
  let convertedExpenses = convertExpenses(expenses); // convert expenses into csv object
  let csvExpenses = csvUtils.sort(convertedExpenses, 'Purchase Date'); // sort by purchase date
  let csvFileString = csvUtils.generate(csvExpenses); // convert to csv file string
  csvUtils.download(csvFileString, filename); // download csv file string as .csv
} // download

/**
 * Converts expenses to an array of objects to pass in to csvUtils.generate(). Expects
 * an array of expenses but supports having a single expense object.
 * @param expenses - expense object to convert
 * @return a new object passable to csv.js
 */
export function convertExpenses(expenses) {
  if (!Array.isArray(expenses)) expenses = [expenses];
  let tempExpenses = [];
  let employees = store.getters.employees;
  let expenseTypes = store.getters.expenseTypes;
  _forEach(expenses, (expense) => {
    let tempExpense = _cloneDeep(expense);

    // add first name, last name, and employee #
    _forEach(employees, (employee) => {
      if (employee.id === tempExpense.employeeId) {
        tempExpense.employeeNumber = employee.employeeNumber;
        tempExpense.lastname = employee.lastName;
        tempExpense.firstName = employee.firstName;
        return; // break loop
      }
    });

    // add expense type
    _forEach(expenseTypes, (type) => {
      if (type.id === tempExpense.expenseTypeId) {
        tempExpense.expenseType = type.budgetName;
      }
      return; // break loop
    });

    // combine together and add
    tempExpenses.push({
      'First Name': tempExpense.firstName || '',
      'Last Name': tempExpense.lastName || '',
      'Employee #': tempExpense.employeeNumber || '',
      'Expense Type': tempExpense.expenseType || '',
      'Recipient Name': getRecipientName(tempExpense.recipient) || '',
      Cost: tempExpense.cost || '',
      'Purchase Date': format(tempExpense.purchaseDate, null, DEFAULT_ISOFORMAT) || '',
      'Reimbused Date': format(tempExpense.reimbursedDate, null, DEFAULT_ISOFORMAT) || '',
      Category: tempExpense.category || '',
      // some descriptions have weird formatting, particularly high fives
      Description:
        tempExpense.description
          ?.replaceAll('\n', '')
          ?.replaceAll(/\s{2,}/gi, ' ')
          ?.trim() || '',
      Note: tempExpense.note?.trim() || ''
    });
  });

  return tempExpenses;
} // convertExpenses

/**
 * Gets the employee's preferred name.
 *
 * @param {String} employeeId - The employee ID
 * @returns String - The employees preferred name
 */
function getRecipientName(employeeId) {
  let employee = _find(store.getters.employees, (e) => e.id === employeeId);
  return employee ? `${employee.nickname || employee.firstName} ${employee.lastName}` : null;
} // getRecipientName

export default {
  download,
  convertExpenses
};
