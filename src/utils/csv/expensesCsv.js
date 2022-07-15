/**
 * Utilities to convert expense objects into objects passable to
 * csv.js
 */
import _ from 'lodash';
import store from '/store/index.js';
const csvUtils = require('./baseCsv.js');

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
  _.forEach(expenses, (expense) => {
    let tempExpense = _.cloneDeep(expense);

    // add first name, last name, and employee #
    _.forEach(employees, (employee) => {
      if (employee.id === tempExpense.employeeId) {
        tempExpense.employeeNumber = employee.employeeNumber;
        tempExpense.lastname = employee.lastName;
        tempExpense.firstName = employee.firstName;
        return; // break loop
      }
    });

    // add expense type
    _.forEach(expenseTypes, (type) => {
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
      Cost: tempExpense.cost || '',
      'Purchase Date': tempExpense.purchaseDate || '',
      'Reimbused Date': tempExpense.reimbursedDate || '',
      Category: tempExpense.category || ''
    });
  });

  return tempExpenses;
} // convertExpenses
