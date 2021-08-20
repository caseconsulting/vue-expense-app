<template>
  <div>
    <v-dialog v-if="hasBudgets" v-model="activate" persistent max-width="400">
      <v-card>
        <!-- Anniversary Date -->
        <v-toolbar color="#565651" dark>
          <v-toolbar-title>Anniversary Date: {{ getAnniversaryDate }}</v-toolbar-title>
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
            <v-list-item ripple @click.native="activate = false" class="list-hover">
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
    <v-dialog v-else v-model="activate" persistent max-width="400">
      <v-card>
        <!-- Anniversary Date -->
        <v-toolbar color="#565651" dark>
          <v-toolbar-title>Anniversary Date: {{ getAnniversaryDate }}</v-toolbar-title>
        </v-toolbar>
        <!-- End Anniversary Date -->

        <!-- Buttons -->
        <v-list two-line>
          <!-- Budget List -->
          <template>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <h2 class="text-center">No Previous Years</h2>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
          </template>
          <!-- End Budget List -->

          <!-- Cancel Button -->
          <template>
            <v-list-item ripple @click.native="activate = false" class="list-hover">
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
  </div>
</template>

<script>
const IsoFormat = 'YYYY-MM-DD';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

/**
 * Gets the anniversary date based on hire date.
 *
 * @returns String - anniversary date
 */
function getAnniversaryDate() {
  return moment(this.hireDate).format('MMMM Do');
} // getAnniversaryDate

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
  let fiscalYear = moment(this.hireDate, IsoFormat);
  fiscalYear.year(budgetYear);
  this.emit(`selected-budget-year`, fiscalYear);
  this.activate = false;
} // select

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    getAnniversaryDate
  },
  data() {
    return {
      activate: false // dialog activator
    };
  },
  methods: {
    emit,
    isCurrent,
    select
  },
  props: [
    'toggleBudgetSelectModal', // dialog activator
    'budgetYears', // all budget years
    'current', // current fiscal date view
    'hireDate', // employee hire date
    'hasBudgets'
  ],
  watch: {
    toggleBudgetSelectModal: function () {
      this.activate = true;
    }
  }
};
</script>

<style scoped>
.center-text {
  text-align: center;
}

.list-hover:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}

.underline-text {
  text-decoration: underline;
}
</style>
