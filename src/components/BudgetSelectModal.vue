<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="400">
      <v-card>
        <v-toolbar color="#565651" dark>
          <v-toolbar-title>Anniversary Date: {{ moment(hireDate).format('MMMM Do') }}</v-toolbar-title>
        </v-toolbar>
        <v-list two-line>
          <template v-for="(budgetYear, index) in budgetYears">
            <v-list-item :key="budgetYear" ripple @click.native="select(budgetYear)" class="list-hover">
              <v-list-item-content>
                <v-list-item-title>
                  <h2 v-bind:class="{ 'center-text': true, 'underline-text': isCurrent(budgetYear) }">
                    {{ budgetYear }} - {{ budgetYear + 1 }}
                  </h2>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider :key="index"></v-divider>
          </template>
          <template>
            <v-list-item ripple @click.native="emit(`cancel-budget-year`)" class="list-hover">
              <v-list-item-content>
                <v-list-item-title><h2 class="center-text">Cancel</h2></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
const Moment = require('moment');
const IsoFormat = 'YYYY-MM-DD';

function select(budgetYear) {
  let fiscalYear = Moment(this.hireDate, IsoFormat);
  fiscalYear.year(budgetYear);
  this.emit(`selected-budget-year`, fiscalYear);
}

function isCurrent(budgetYear) {
  let [year] = this.current.split('-');
  return budgetYear == year;
}

export default {
  props: ['budgetYears', 'current', 'hireDate', 'activate'],
  methods: {
    emit(msg, data) {
      if (data) {
        window.EventBus.$emit(msg, data);
      } else {
        window.EventBus.$emit(msg);
      }
    },
    select,
    isCurrent
  }
};
</script>

<style>
.center-text {
  text-align: center;
}

.list-hover:hover {
  background-color: #f0f0f0;
}

.underline-text {
  text-decoration: underline;
}
</style>
