/**
 * Utilities to convert expense objects into objects passable to
 * csv.js
 */
import { format, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import { indexBy } from '@/utils/utils.js';
import store from '~/store/index.js';
import api from '~/src/shared/api.js';
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
async function unanetReport(expenses) {
  let csvExpenses = await unanetExpenseData(expenses); // convert expenses into csv object
  let csvFileString = csvUtils.generate(csvExpenses); // convert to csv file string
  csvUtils.download(csvFileString, 'unanet_report.csv'); // download csv file string as .csv
} // unanetReport

async function unanetExpenseData(expenses) {
  if (!Array.isArray(expenses)) expenses = [expenses];
  let employees = indexBy(store.getters.employees, 'id');
  let expenseTypes = indexBy(store.getters.expenseTypes, 'id');
  let { projects: unanetProjects, expenseTypes: unanetETs } = await api.getUnanetExpenseTypes();
  unanetProjects = indexBy(unanetProjects, 'key');
  unanetETs = indexBy(unanetETs, 'key');
  
  let employee, expenseType, unanetET, unanetProject;
  let orgCode, projCode, taskName, expType;
  return expenses.map((expense) => {
    employee = employees[expense.employeeId];
    expenseType = expenseTypes[expense.expenseTypeId];
    unanetET = unanetETs[expenseType.unanetExpenseType]
    unanetProject = unanetProjects[expenseType.unanetProject];

    console.log(unanetET);
    console.log(unanetProject);

    orgCode = unanetProject?.orgCode ?? ''; // eg. I_CASE
    projCode = unanetProject?.code ?? ''; // eg. FRINGE.BENEFITS.GRAY
    taskName = unanetET?.code?.toLowerCase() === 'team leads' ? 'Team Leads' : ''; // 'Team Leads' or nothing
    expType = unanetET?.code; // eg. PHONE.INTERNET

    return {
      'username': employee.email,
      'purpose': expenseType.budgetName,
      'location': '', // blank
      'project_org_code': orgCode,
      'project_code': projCode,
      'task_name': taskName,
      'expense_date': format(expense.createdAt, null, FORMATTED_ISOFORMAT),
      'expense_type': expType,
      'currency_code': 'USD',
      'amount': expense.cost,
      'exchange_rate': 1, // USD -> USD is just 1
      'payment_method': '*Employee Paid', // *Employee Paid
      'project_type': '', // blank
      'comments': '', // blank
      'receipt_included': expense.receipt ? 'Y' : 'N',
      'no_receipt_reason': '', // blank
      'vendor_name': '', // blank
      'vat_amount': 0, // always 0
      'vat_location': '', // blank
      'post_date': '', // blank
      'cost_account': '', // blank
      'exp_voucher': '', // blank
      'delete': '', // blank
      'ic_amount': '', // blank
      'ic_cost_structure': '', // blank
      'ic_cost_element': '', // blank
      'amount_in': '' // blank
    }

    // return {
    //   username: employee.email, // email
    //   purpose: expenseType, // blank
    //   location: '', // blank
    //   project_org_code: '',
    //   project_code: '',
    //   task_name: '',
    //   expense_date: format(expense.createdAt, null, FORMATTED_ISOFORMAT),
    //   expense_type: expenseType,
    //   currency_code: 'USD', // USD
    //   amount: expense.cost,
    //   exchange_rate: 1, // 1
    //   payment_method: '*Employee Paid', // *Employee Paid
    //   project_type: '', // blank
    //   comments: '', // blank
    //   receipt_included: expense.receipt ? 'Y' : 'N',
    //   no_receipt_reason: '', // blank
    //   vendor_name: '', // blank
    //   vat_amount: 0, // 0
    //   vat_location: '', // blank
    //   post_date: '', // blank
    //   cost_account: '', // blank
    //   exp_voucher: '', // blank
    //   delete: '', // blank
    //   ic_amount: '', // blank
    //   ic_cost_structure: '', // blank
    //   ic_cost_element: '', // blank
    //   amount_in: '' // blank
    // };
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
