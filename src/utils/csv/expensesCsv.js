/**
 * Utilities to convert expense objects into objects passable to
 * csv.js
 */
import store from '~/store/index.js';
import { format, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import csvUtils from '@/utils/csv/baseCsv.js';

/**
 * Downloads array of expenses as csv file.
 * @param expenses - array of expense objects
 */
function download(expenses) {
  let filename = Array.isArray(expenses) ? 'expenses.csv' : 'expense.csv';
  let convertedExpenses = convertExpenses(expenses); // convert expenses into csv object
  let csvExpenses = csvUtils.sort(convertedExpenses, 'Purchase Date'); // sort by purchase date
  let csvFileString = csvUtils.generate(csvExpenses); // convert to csv file string
  csvUtils.download(csvFileString, filename); // download csv file string as .csv
} // download

/**
 * Downloads array of expenses as a report for Unanet import.
 * @param expenses - array of expense objects
 */
function unanetReport(expenses) {
  let csvExpenses = unanetExpenseData(expenses); // convert expenses into csv object
  let csvFileString = csvUtils.generate(csvExpenses); // convert to csv file string
  csvUtils.download(csvFileString, 'unanet_report.csv'); // download csv file string as .csv
} // unanetReport

function unanetExpenseData(expenses) {
  if (!Array.isArray(expenses)) expenses = [expenses];
  let employees = store.getters.employees;
  let employee;
  let expenseTypes = store.getters.expenseTypes;
  let expenseType;
  return expenses.map((expense) => {
    employee = employees.find((employee) => {
      return employee.id === expense.employeeId;
    });

    expenseTypes.forEach((type) => {
      if (type.id === expense.expenseTypeId) {
        expenseType = type.budgetName;
      }
    });

    return {
      username: employee.email, // email
      purpose: '', // blank
      location: '', // blank
      project_org_code: '',
      project_code: '',
      task_name: '',
      expense_date: format(expense.createdAt, null, FORMATTED_ISOFORMAT),
      expense_type: expenseType,
      currency_code: 'USD', // USD
      amount: expense.cost,
      exchange_rate: 1, // 1
      payment_method: '*Employee Paid', // *Employee Paid
      project_type: '', // blank
      comments: '', // blank
      receipt_included: expense.receipt ? 'Y' : 'N',
      no_receipt_reason: '', // blank
      vendor_name: '', // blank
      vat_amount: 0, // 0
      vat_location: '', // blank
      post_date: '', // blank
      cost_account: '', // blank
      exp_voucher: '', // blank
      delete: '', // blank
      ic_amount: '', // blank
      ic_cost_structure: '', // blank
      ic_cost_element: '', // blank
      amount_in: '' // blank
    };
  });
}

/**
 * Converts expenses to an array of objects to pass in to csvUtils.generate(). Expects
 * an array of expenses but supports having a single expense object.
 * @param expenses - expense object to convert
 * @return a new object passable to csv.js
 */
function convertExpenses(expenses) {
  if (!Array.isArray(expenses)) expenses = [expenses];
  let tempExpenses = [];
  let employees = store.getters.employees;
  let expenseTypes = store.getters.expenseTypes;
  for (let expense of expenses ?? []) {
    // add first name, last name, and employee #
    employees.forEach((employee) => {
      if (employee.id === expense.employeeId) {
        expense.employeeNumber = employee.employeeNumber;
        expense.lastname = employee.lastName;
        expense.firstName = employee.firstName;
        return; // break loop
      }
    });

    // add expense type
    expenseTypes.forEach((type) => {
      if (type.id === expense.expenseTypeId) {
        expense.expenseType = type.budgetName;
      }
      return; // break loop
    });

    // combine together and add
    tempExpenses.push({
      'First Name': expense.firstName || '',
      'Last Name': expense.lastName || '',
      'Employee #': expense.employeeNumber || '',
      'Expense State': expense.state || 'UNDEFINED',
      'Expense Type': expense.expenseType || '',
      'Recipient Name': getRecipientName(expense.recipient) || '',
      Cost: expense.cost || '',
      'Purchase Date': format(expense.purchaseDate, null, DEFAULT_ISOFORMAT) || '',
      'Reimbused Date': format(expense.reimbursedDate, null, DEFAULT_ISOFORMAT) || '',
      Category: expense.category || '',
      // some descriptions have weird formatting, particularly high fives
      Description:
        expense.description
          ?.replaceAll('\n', '')
          ?.replaceAll(/\s{2,}/gi, ' ')
          ?.trim() || '',
      Note: expense.note?.trim() || ''
    });
  }

  return tempExpenses;
} // convertExpenses

/**
 * Gets the employee's preferred name.
 *
 * @param {String} employeeId - The employee ID
 * @returns String - The employees preferred name
 */
function getRecipientName(employeeId) {
  let employee = store.getters.employees.find((e) => e.id === employeeId);
  return employee ? `${employee.nickname || employee.firstName} ${employee.lastName}` : null;
} // getRecipientName

export default {
  download,
  unanetReport
};
