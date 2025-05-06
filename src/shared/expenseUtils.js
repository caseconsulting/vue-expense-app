export const STATES = {
  CREATED: 'CREATED',
  APPROVED: 'APPROVED',
  REIMBURSED: 'REIMBURSED',
  REJECTED: 'REJECTED',
  RETURNED: 'RETURNED',
  REVISED: 'REVISED'
};

/**
 * Returns true if an employee has the right to edit an expense
 *
 * @param expense expense to check
 * @returns
 */
export function isEditableByEmployee(expense) {
  if (!expense?.state) throw new Error('Expense has no state.');
  let editableStates = [STATES.CREATED, STATES.REVISED, STATES.RETURNED];
  return editableStates.includes(expense.state);
}
