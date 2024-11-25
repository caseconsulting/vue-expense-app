<template>
  <div>
    <!-- Loop Awards -->
    <div v-for="(award, index) in editedAwards" class="gray-border ma-0 pt-3 pb-1 px-5" :key="index">
      <!-- Name of Award -->
      <v-text-field
        ref="formFields"
        v-model="award.name"
        :rules="getRequiredRules()"
        label="Award"
        variant="underlined"
        data-vv-name="Award"
        clearable
      >
      </v-text-field>

      <v-row class="py-3">
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Received Date -->
          <v-text-field
            ref="formFields"
            :model-value="format(award.dateReceived, null, 'MM/YYYY')"
            label="Date Received"
            :rules="getDateMonthYearRules()"
            hint="MM/YYYY format"
            v-mask="'##/####'"
            variant="underlined"
            persistent-hint
            @update:focused="award.dateReceived = parseEventDate()"
            clearable
            prepend-icon="mdi-calendar"
            @click:prepend="award.showReceivedMenu = true"
            @keypress="award.showReceivedMenu = false"
            autocomplete="off"
          >
            <v-menu
              activator="parent"
              v-model="award.showReceivedMenu"
              :close-on-content-click="false"
              location="start center"
            >
              <v-date-picker
                v-model="award.dateReceived"
                @update:model-value="award.showReceivedMenu = false"
                show-adjacent-months
                hide-actions
                keyboard-icon=""
                color="#bc3825"
                title="Date Received"
              ></v-date-picker>
            </v-menu>
          </v-text-field>
          <!-- End Received Date -->
        </v-col>
        <v-col class="pb-1" sm="6" md="12" lg="6" align="center">
          <v-btn @click="deleteAward(index)" icon variant="text">
            <v-tooltip activator="parent" location="bottom">Delete Award</v-tooltip>
            <v-icon class="case-gray pr-1">mdi-delete</v-icon></v-btn
          >
        </v-col>
      </v-row>
    </div>
    <!-- Loop Awards -->

    <!-- Button to Add Awards -->
    <div class="pt-4" align="center">
      <v-btn @click="addAward()" elevation="2">
        <v-icon class="pr-1">mdi-plus</v-icon>
        Award
      </v-btn>
    </div>
  </div>
</template>

<script>
import _isArray from 'lodash/isArray';
import _cloneDeep from 'lodash/cloneDeep';
import { getDateMonthYearRules, getRequiredRules } from '@/shared/validationUtils.js';
import { format, getTodaysDate } from '@/shared/dateUtils';
import { asyncForEach } from '@/utils/utils';
import { mask } from 'vue-the-mask';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  this.emitter.emit('created', 'awards'); // emit awards tab was created
  this.employees = this.$store.getters.employees; // get all employees
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add an award.
 */
function addAward() {
  if (!this.editedAwards) this.editedAwards = [];
  this.editedAwards.push({
    name: null,
    dateReceived: null,
    expirationDate: null,
    dateSubmitted: getTodaysDate(),
    showReceivedMenu: false,
    showExpirationMenu: false
  });
} // addAward

/**
 * Delete an award.
 *
 * @param index - The index of the award to delete
 */
function deleteAward(index) {
  this.editedAwards.splice(index, 1);
} // deleteAward

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return this.format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} // parseEventDate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) errorCount++;
  });
  this.emitter.emit('doneValidating', { tab: 'awards', data: this.editedAwards }); // emit done validating and sends edited data back to parent
  this.emitter.emit('awardStatus', errorCount); // emit error status
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - checks val.
 *
 * @param val - value that needs to exist
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      editedAwards: _cloneDeep(this.model) // stores edited awards info
    };
  },
  directives: { mask },
  methods: {
    addAward,
    deleteAward,
    format,
    getDateMonthYearRules,
    getTodaysDate,
    getRequiredRules,
    parseEventDate,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
