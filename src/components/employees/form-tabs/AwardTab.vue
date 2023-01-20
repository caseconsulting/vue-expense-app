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
        data-vv-name="Award"
        clearable
      >
      </v-text-field>

      <v-row class="py-3">
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Received Date -->
          <v-menu
            v-model="award.showReceivedMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                ref="formFields"
                :value="format(award.dateReceived, null, 'MM/YYYY')"
                label="Date Received"
                prepend-icon="event_available"
                :rules="getDateMonthYearRules()"
                hint="MM/YYYY format"
                v-mask="'##/####'"
                persistent-hint
                v-on="on"
                @blur="award.dateReceived = parseEventDate($event)"
                clearable
                @input="award.showReceivedMenu = false"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="award.dateReceived"
              no-title
              @input="award.showReceivedMenu = false"
              type="month"
            ></v-date-picker>
            <!-- Hidden field to record the date the user submitted -->
            <v-date-picker
              v-show="false"
              v-model="award.dateInpoot"
              no-title
              @input="award.showReceivedMenu = false"
            ></v-date-picker>
          </v-menu>
          <!-- End Received Date -->
        </v-col>
        <v-col class="pb-1" sm="6" md="12" lg="6" align="center">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" @click="deleteAward(index)" icon text
                ><v-icon class="case-gray pr-1">delete</v-icon></v-btn
              >
            </template>
            <span>Delete Award</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>
    <!-- Loop Awards -->

    <!-- Button to Add Awards -->
    <div class="pt-4" align="center">
      <v-btn @click="addAward()" elevation="2"><v-icon class="pr-1">add</v-icon>Award</v-btn>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { getDateMonthYearRules, getRequiredRules } from '@/shared/validationUtils.js';
import { format, getTodaysDate } from '@/shared/dateUtils';
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
  window.EventBus.$emit('created', 'awards'); // emit awards tab was created
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
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });
  window.EventBus.$emit('doneValidating', 'awards', this.editedAwards); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('awardStatus', errorCount); // emit error status
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
      editedAwards: _.cloneDeep(this.model) // stores edited awards info
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
