/*
 * Helpful references
 * https://vuejs-tips.github.io/vuex-cheatsheet/
 * https://vuex.vuejs.org/
 *
 * Once the app is working with all the changes, I want to restructure this file
 * and split it into multiple files based on use case.
 * e.g. all current user data in one file
 *      all expense data in one file
 *      all employees/basecamp/twitter
 *      meta data/other supporting stuff?
 *
 */

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state() {
    return {
      basecampAvatars: null,
      employees: null,
      employeeNumber: null,
      expenseTypes: null,
      fiscalDateView: null,
      storeIsPopulated: false,
      user: null,
      userRole: null,
      events: null,
      budgets: null,
      loginTime: null,
      quickbooksPTO: null,
      quickbooksMonthlyHours: null
    };
  },
  mutations: {
    setBasecampAvatars(state, payload) {
      state.basecampAvatars = payload.basecampAvatars;
    },
    setEmployees(state, payload) {
      state.employees = payload.employees;
    },
    setExpenseTypes(state, payload) {
      state.expenseTypes = payload.expenseTypes;
    },
    setStoreIsPopulated(state, payload) {
      state.storeIsPopulated = payload.populated;
    },
    setUser(state, payload) {
      state.user = payload.user;
      state.userRole = payload.user.employeeRole;
      state.employeeNumber = payload.user.employeeNumber;
    },
    setEvents(state, payload) {
      state.events = payload.events;
    },
    setBudgets(state, payload) {
      state.budgets = payload.budgets;
    },
    setLoginTime(state, payload) {
      state.loginTime = payload.loginTime;
    },
    setQuickbooksPTO(state, payload) {
      state.quickbooksPTO = payload.quickbooksPTO;
    },
    setQuickbooksMonthlyHours(state, payload) {
      state.quickbooksMonthlyHours = payload.quickbooksMonthlyHours;
    }
  },
  actions: {
    setBasecampAvatars(context, payload) {
      context.commit('setBasecampAvatars', payload);
    },
    setEmployees(context, payload) {
      context.commit('setEmployees', payload);
    },
    setExpenseTypes(context, payload) {
      context.commit('setExpenseTypes', payload);
    },
    setStoreIsPopulated(context, payload) {
      context.commit('setStoreIsPopulated', payload);
    },
    setUser(context, payload) {
      context.commit('setUser', payload);
    },
    setEvents(context, payload) {
      context.commit('setEvents', payload);
    },
    setBudgets(context, payload) {
      context.commit('setBudgets', payload);
    },
    setLoginTime(context, payload) {
      context.commit('setLoginTime', payload);
    },
    setQuickbooksPTO(context, payload) {
      context.commit('setQuickbooksPTO', payload);
    },
    setQuickbooksMonthlyHours(context, payload) {
      context.commit('setQuickbooksMonthlyHours', payload);
    }
  },
  getters: {
    basecampAvatars(state) {
      return state.basecampAvatars;
    },
    employees(state) {
      return state.employees;
    },
    employeeNumber(state) {
      return state.employeeNumber;
    },
    expenseTypes(state) {
      return state.expenseTypes;
    },
    storeIsPopulated(state) {
      return state.storeIsPopulated;
    },
    user(state) {
      return state.user;
    },
    userRole(state) {
      return state.userRole;
    },
    events(state) {
      return state.events;
    },
    budgets(state) {
      return state.budgets;
    },
    loginTime(state) {
      return state.loginTime;
    },
    quickbooksPTO(state) {
      return state.quickbooksPTO;
    },
    quickbooksMonthlyHours(state) {
      return state.quickbooksMonthlyHours;
    }
  }
});
