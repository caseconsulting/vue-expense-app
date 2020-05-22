<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="400">
      <v-card>
        <!-- Anniversary Date -->
        <v-toolbar color="#565651" dark>
          <v-toolbar-title>Anniversary Date: {{ moment(hireDate).format('MMMM Do') }}</v-toolbar-title>
        </v-toolbar>
        <!-- End Anniversary Date -->

        <!-- Buttons -->
        <v-list two-line>
          <!-- Budget List -->
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
          <!-- End Budget List -->

          <!-- Cancel Button -->
          <template>
            <v-list-item ripple @click.native="emit(`cancel-budget-year`)" class="list-hover">
              <v-list-item-content>
                <v-list-item-title><h2 class="center-text">Cancel</h2></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <!-- End Cancel Button -->
        </v-list>
        <!-- End Buttons -->
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
const IsoFormat = 'YYYY-MM-DD';
const Moment = require('moment');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    window.EventBus.$emit(msg, data);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
  }
} // emit

/**
 * Checks if a given budget year is the same as the current budget year displayed.
 *
 * @param budgetYear - int budget year to compare to current
 * @return boolean - given budget year is equal to current
 */
function isCurrent(budgetYear) {
  let [year] = this.current.split('-');
  return budgetYear == year;
} // isCurrent

/**
 * Set and emit the selected budget year.
 *
 * @param budgetYear - int budget year selected
 */
function select(budgetYear) {
  let fiscalYear = Moment(this.hireDate, IsoFormat);
  fiscalYear.year(budgetYear);
  this.emit(`selected-budget-year`, fiscalYear);
} // select

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  methods: {
    emit,
    isCurrent,
    select
  },
  props: [
    'activate', // dialog activator
    'budgetYears', // all budget years
    'current', // current fiscal date view
    'hireDate' // employee hire date
  ]
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
