export const EXPENSE_STATES = {
  CREATED: 'CREATED',
  APPROVED: 'APPROVED',
  PART_APPROVED: 'PART_APPROVED',
  EXT_PROC: 'EXT_PROC',
  REIMBURSED: 'REIMBURSED',
  REJECTED: 'REJECTED',
  RETURNED: 'RETURNED',
  REVISED: 'REVISED'
};

export const EMPTY_APPROVAL = {
  HRE: null,
  FIN: null,
  ADM: null
}

/**
 * Returns true if a given user has the right to edit an expense
 *
 * @param employee employee object to check
 * @param expense expense to check
 * @returns
 */
export function isExpenseEditable(employee, expense) {
  if (!expense?.state) throw new Error('Expense has no state.');
  if (!employee.employeeRole) throw new Error('employeeRole is missing from user.') 
  
  // admins can always edit
  let privilegedRoles = ['admin', 'manager'];
  if (privilegedRoles.includes(employee.employeeRole)) return true;

  // other users can edit on state condition
  let editableStates = [EXPENSE_STATES.CREATED, EXPENSE_STATES.REVISED, EXPENSE_STATES.RETURNED];
  return editableStates.includes(expense.state);
}
