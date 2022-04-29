// |--------------------------------------------------|
// |                                                  |
// |             Update store functions               |
// |                                                  |
// |--------------------------------------------------|

import api from '@/shared/api.js';

/**
 * Update store with latest user data
 *
 */
export async function updateStoreUser() {
  // getUser
  let user = await api.getUser();
  this.$store.dispatch('setUser', { user });
} // updateStoreUser

/**
 * Update store with latest employee data
 *
 */
export async function updateStoreEmployees() {
  // getEmployees
  let employees = await api.getItems(api.EMPLOYEES);
  this.$store.dispatch('setEmployees', { employees });
} // updateStoreEmployees

/**
 * Update store with latest Basecamp avatars
 *
 */
export async function updateStoreAvatars() {
  // getBasecampAvatars
  let avatars = await api.getBasecampAvatars();
  this.$store.dispatch('setBasecampAvatars', { basecampAvatars: avatars });
} // updateStoreAvatars

/**
 * Update store with latest expense type data
 *
 */
export async function updateStoreExpenseTypes() {
  // getExpenseTypes
  let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
  this.$store.dispatch('setExpenseTypes', { expenseTypes });
} // updateStoreExpenseTypes
