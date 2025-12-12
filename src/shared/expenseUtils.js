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


/**
 * Quick expense modifiers, to be used in quick actions menu
 */
async function quickApprove(exp, { user, date }) {
  if (!user?.id || !date)
    throw new Error('Options `user` with `.id` and `date` are required.')
  exp.state = EXPENSE_STATES.APPROVED;
  exp.approvals = { by: user.id, date };
  await updateExpense(exp);
  return exp;
}
async function quickUnapprove(exp) {
  exp.state = EXPENSE_STATES.CREATED;
  exp.approvals = EMPTY_APPROVAL;
  await updateExpense(exp);
  return exp
}
async function quickRejectReturn(exp, options) {
  if (!rejectingExpense || !toggleExpenseRejectionModal)
    throw new Error('Options `rejectingExpense` and `toggleExpenseRejectionModal` are required.')
  options.rejectingExpense.value = exp;
  options.toggleExpenseRejectionModal.value = true;
}
async function quickReject(exp, options) {
  if (!defaultRejectionType || !rejectingExpense || !toggleExpenseRejectionModal)
    throw new Error('Options `defaultRejectionType`, `rejectingExpense`, and `toggleExpenseRejectionModal` are required.')
  options.defaultRejectionType.value = 'hard';
  options.rejectingExpense.value = exp;
  options.toggleExpenseRejectionModal.value = true;
}
async function quickRemoveRejection(exp) {
  if (exp.state === EXPENSE_STATES.REJECTED) {
    exp.rejections.hardRejections = null;
  }
  if (exp.rejections.softRejections) {
    exp.rejections.softRejections.reasons.pop();
    exp.rejections.softRejections.revised = true;
    if (exp.rejections.softRejections.reasons.length === 0) delete exp.rejections;
  }
  exp.state = EXPENSE_STATES.CREATED;
  await updateExpense(exp);
  return exp;
}
async function quickReimburse(exp, { date }) {
  if (!date) throw new Error('Option `date` is required.');
  exp.state = EXPENSE_STATES.REIMBURSED;
  exp.reimbursedDate = date;
  await updateExpense(exp);
  return exp;
}
async function quickUnreimburse(exp) {
  exp.state = EXPENSE_STATES.APPROVED;
  exp.reimbursedDate = null;
  await updateExpense(e);
  return exp;
}

/**
 * Combine quick functions from above into one caller
 */
export const quickStatesMenuActions = {
  APPROVE: quickApprove,
  UNAPPROVE: quickUnapprove,
  REJECT_RETURN: quickRejectReturn,
  REJECT: quickReject,
  REMOVE_REJECTION: quickRemoveRejection,
  REIMBURSE: quickReimburse,
  UNREIMBURSE: quickUnreimburse,
}