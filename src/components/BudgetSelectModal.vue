<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="400">
      <v-card>
        <v-toolbar color="#565651" dark>
          <v-toolbar-title>Anniversary Date: {{ moment(hireDate).format('MMMM Do') }}</v-toolbar-title>
        </v-toolbar>
        <v-list two-line>
          <template v-for="(budgetYear, index) in budgetYears">
            <v-list-tile :key="budgetYear" ripple @click.native="select(budgetYear)" class="list-hover">
              <v-list-tile-content>
                <v-list-tile-title>
                  <h2 class="center-text">{{ budgetYear }} - {{ budgetYear + 1 }}</h2>
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider :key="index"></v-divider>
          </template>
          <template>
            <v-list-tile ripple @click.native="emit(`cancel-budget-year`)" class="list-hover">
              <v-list-tile-content>
                <v-list-tile-title><h2 class="center-text">Cancel</h2></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
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

export default {
  props: ['budgetYears', 'hireDate', 'activate'],
  methods: {
    emit(msg, data) {
      if (data) {
        window.EventBus.$emit(msg, data);
      } else {
        window.EventBus.$emit(msg);
      }
    },
    select
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
</style>
