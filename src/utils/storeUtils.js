// |--------------------------------------------------|
// |                                                  |
// |             Update store functions               |
// |                                                  |
// |--------------------------------------------------|

import api from '@/shared/api.js';
import store from '../../store/index.js';
import { userRoleIsAdmin, userRoleIsManager, userRoleIsUser } from '@/utils/utils';

/**
 * Update store with latest user data
 */
export async function updateStoreUser() {
  // getUser
  let user = await api.getUser();
  this.$store.dispatch('setUser', { user });
} // updateStoreUser

/**
 * Update store with latest employee data
 */
export async function updateStoreEmployees() {
  // getEmployees
  let employees = await api.getItems(api.EMPLOYEES);
  this.$store.dispatch('setEmployees', { employees });
} // updateStoreEmployees

/**
 * Update store with latest Basecamp avatars
 */
export async function updateStoreAvatars() {
  let avatars = await api.getBasecampAvatars();
  this.$store.dispatch('setBasecampAvatars', { basecampAvatars: avatars });
} // updateStoreAvatars

/**
 * Update store with latest Basecamp campfires
 */
export async function updateStoreCampfires() {
  let campfires = await api.getBasecampCampfires();
  this.$store.dispatch('setBasecampCampfires', { basecampCampfires: campfires });
} // updateStoreCampfires

/**
 * Update store with latest contracts
 */
export async function updateStoreContracts() {
  let contracts = await api.getItems(api.CONTRACTS);
  this.$store.dispatch('setContracts', { contracts });
} // updateStoreContracts

/**
 * Update store with users budgets
 */
export async function updateStoreBudgets() {
  let user = this.$store.getters.user;
  let budgets = await api.getAllActiveEmployeeBudgets(user.id);
  this.$store.dispatch('setBudgets', { budgets: budgets });
} // updateStoreBudgets

/**
 * Update store with users budgets
 */
export async function updateStorePtoCashOuts() {
  let user = store.getters.user;
  let ptoCashOuts = [];
  if (userRoleIsAdmin() || userRoleIsManager()) {
    ptoCashOuts = await api.getItems(api.PTO_CASH_OUTS);
  } else if (userRoleIsUser()) {
    ptoCashOuts = await api.getEmployeePtoCashOuts(user.id);
  }
  store.dispatch('setPtoCashOuts', { ptoCashOuts: ptoCashOuts });
} // updateStoreBudgets

/**
 * Update store with latest expense type data
 */
export async function updateStoreExpenseTypes() {
  // getExpenseTypes
  let user = store.getters.user;
  let employeeRole = user.employeeRole;
  if (employeeRole == 'admin' || employeeRole == 'manager') {
    let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
    store.dispatch('setExpenseTypes', { expenseTypes });
  } else if (employeeRole == 'intern' || employeeRole == 'user') {
    let expenseTypes = await api.getEmployeeExpenseTypes();
    store.dispatch('setExpenseTypes', { expenseTypes });
  }
} // updateStoreExpenseTypes

/**
 * Update store with latest tag data
 */
export async function updateStoreTags() {
  let user = store.getters.user;
  let employeeRole = user.employeeRole;
  if (employeeRole == 'admin' || employeeRole == 'manager') {
    let tags = await api.getItems(api.TAGS);
    store.dispatch('setTags', { tags });
  }
} // updateStoreTags
