<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="400">
      <v-card>
        <!-- Anniversary Date -->
        <v-toolbar color="#565651" dark>
          <v-toolbar-title>Anniversary Date: {{ getAnniversaryDate }}</v-toolbar-title>
        </v-toolbar>
        <!-- End Anniversary Date -->
        <!-- Buttons -->
        <v-list lines="two" class="pb-0">
          <!-- Budget List -->
          <div v-if="budgetYears.length > 0">
            <div v-for="(budgetYear, index) in budgetYears" :key="budgetYear">
              <v-list-item ripple @click.native="select(budgetYear)" class="pointer">
                <v-list-item-title>
                  <h2 v-bind:class="{ 'text-center': true, 'text-decoration-underline': isCurrent(budgetYear) }">
                    {{ budgetYear }} - {{ budgetYear + 1 }}
                  </h2>
                </v-list-item-title>
              </v-list-item>
              <v-divider :key="index"></v-divider>
            </div>
          </div>
          <div v-else>
            <p class="text-center my-3 font-italic">No Previous Years</p>
          </div>
          <!-- End Budget List -->

          <!-- Cancel Button -->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-3" variant="text" @click.native="activate = false"> Close </v-btn>
          </v-card-actions>
          <!-- End Cancel Button -->
        </v-list>
        <!-- End Buttons -->
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { format, setYear } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the anniversary date based on hire date.
 *
 * @return String - anniversary date
 */
function getAnniversaryDate() {
  return format(this.hireDate, null, 'MMMM Do');
} // getAnniversaryDate

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
  let fiscalYear = setYear(this.hireDate, budgetYear);
  this.emitter.emit(`selected-budget-year`, fiscalYear);
  this.activate = false;
} // select

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleBudgetSelectModal
 */
function watchToggleBudgetSelectModal() {
  this.activate = true;
} // watchToggleBudgetSelectModal

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
    format,
    isCurrent,
    select,
    setYear
  },
  props: [
    'toggleBudgetSelectModal', // dialog activator
    'budgetYears', // all budget years
    'current', // current fiscal date view
    'hireDate', // employee hire date
    'hasBudgets'
  ],
  watch: {
    toggleBudgetSelectModal: watchToggleBudgetSelectModal
  }
};
</script>
