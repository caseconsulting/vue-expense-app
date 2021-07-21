<template>
  <div>
    <!-- Loop Awards -->
    <div v-for="(award, index) in editedAwards" style="border: 1px solid grey" class="pt-3 pb-1 px-5" :key="index">
      <!-- Name of Award -->
      <v-combobox
        ref="formFields"
        v-model="award.name"
        :rules="requiredRules"
        label="Award"
        data-vv-name="Award"
        clearable
      >
      </v-combobox>

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
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="award.dateReceived | formatDate"
                label="Date Received"
                prepend-icon="event_available"
                :rules="dateRules"
                hint="MM/DD/YYYY format"
                v-mask="'##/##/####'"
                v-bind="attrs"
                v-on="on"
                @blur="award.dateReceived = parseEventDate($event)"
                clearable
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="award.dateReceived"
              no-title
              @input="award.showReceivedMenu = false"
            ></v-date-picker>
          </v-menu>
          <!-- End Received Date -->
        </v-col>
      </v-row>
      <div class="pb-4" align="center">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="deleteAward(index)" icon text
              ><v-icon style="color: grey" class="pr-1">delete</v-icon></v-btn
            >
          </template>
          <span>Delete Award</span>
        </v-tooltip>
      </div>
    </div>
    <!-- Loop Awards -->

    <!-- Button to Add Awards -->
    <div class="pt-4" align="center">
      <v-btn @click="addAward()" elevation="2"><v-icon class="pr-1">add</v-icon>Award</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { formatDate, parseDate, isEmpty } from '@/utils/utils';
import { mask } from 'vue-the-mask';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

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
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
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
  this.editedAwards.push({
    name: null,
    dateReceived: null,
    expirationDate: null,
    showReceivedMenu: false,
    showExpirationMenu: false
  });
} // addAward

/**
 * Delete an award.
 */
function deleteAward(index) {
  this.editedAwards.splice(index, 1);
} // deleteAward

/**
 * Parse the date after losing focus.
 */
function parseEventDate() {
  return parseDate(event.target.value);
} //parseEventDate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;
  let errorCount = 0;
  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    _.forEach(this.$refs.formFields, (field) => {
      if (!field.validate()) {
        errorCount++;
      }
    });
    if (errorCount > 0) {
      hasErrors = true;
    }
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }

  window.EventBus.$emit('doneValidating', 'awards', this.editedAwards); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('awardStatus', [hasErrors, errorCount]); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
      dateOptionalRules: [
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for an optional date
      dateRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid'
      ], // rules for a required date
      editedAwards: _.cloneDeep(this.model), // stores edited awards info
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ] // rules for a required field
    };
  },
  directives: { mask },
  filters: {
    formatDate
  },
  methods: {
    addAward,
    deleteAward,
    parseEventDate,
    isEmpty,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: function (val) {
      if (val) {
        // parent component triggers validation
        this.validateFields();
      }
    }
  }
};
</script>
