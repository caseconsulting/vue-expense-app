import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    expense: {},
    expenseType: {},
    employee: {}
  },
  mutations: {
    setExpense(state, payload) {
      state.expense = payload.expense;
    }
  },
  actions: {}
});
