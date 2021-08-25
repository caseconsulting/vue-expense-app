<template>
  <div>
    <!-- Loop Certifications -->
    <div
      v-for="(certification, index) in editedCertifications"
      style="border: 1px solid grey"
      class="pt-3 pb-1 px-5"
      :key="index"
    >
      <!-- Name of Certification -->
      <v-combobox
        ref="formFields"
        v-model="certification.name"
        :rules="getRequiredRules()"
        :items="certificationDropDown"
        label="Certification"
        data-vv-name="Certification"
        clearable
      >
      </v-combobox>
      <v-row class="pt-1">
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Received Date -->
          <v-menu
            v-model="certification.showReceivedMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="certification.dateReceived | formatDate"
                label="Date Received"
                prepend-icon="event_available"
                :rules="[...getDateRules(), dateOrderRules(index)]"
                hint="MM/DD/YYYY format"
                v-mask="'##/##/####'"
                v-bind="attrs"
                v-on="on"
                @blur="certification.dateReceived = parseEventDate($event)"
                @input="certification.showReceivedMenu = false"
                @focus="certificationIndex = index"
                clearable
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="certification.dateReceived"
              :max="certification.expirationDate"
              no-title
              @input="certification.showReceivedMenu = false"
            ></v-date-picker>
          </v-menu>
          <!-- End Received Date -->
        </v-col>
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Expiration Date -->
          <v-menu
            v-model="certification.showExpirationMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="certification.expirationDate | formatDate"
                :disabled="certification.noExpiry"
                label="Expiration Date"
                prepend-icon="event_busy"
                :rules="[...getDateOptionalRules(), dateOrderRules(index), expDateRule(index)]"
                hint="MM/DD/YYYY format"
                v-mask="'##/##/####'"
                v-bind="attrs"
                v-on="on"
                clearable
                @click:clear="certification.expirationDate = null"
                @blur="certification.expirationDate = parseEventDate($event)"
                @input="certification.showExpirationMenu = false"
                @focus="certificationIndex = index"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="certification.expirationDate"
              :min="certification.dateReceived"
              no-title
              @input="certification.showExpirationMenu = false"
            ></v-date-picker>
          </v-menu>
          <!-- End Expiration Date -->
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" align="center" justify="center" class="pb-4 mb-2">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" @click="deleteCertification(index)" icon text
                ><v-icon style="color: grey">delete</v-icon></v-btn
              >
            </template>
            <span>Delete Certification</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>
    <!-- End Loop Certifications -->

    <!-- Button to Add Certifications -->
    <div class="pt-4" align="center">
      <v-btn @click="addCertification()" elevation="2"><v-icon class="pr-1">add</v-icon>Certification</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { getDateRules, getDateOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { formatDate, parseDate, isEmpty, isMobile } from '@/utils/utils';
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
  window.EventBus.$emit('created', 'certifications'); // emit certifications tab was created
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.populateDropDowns(); // get autocomplete drop down data
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds a certification.
 */
function addCertification() {
  if (!this.editedCertifications) this.editedCertifications = [];
  this.editedCertifications.push({
    name: null,
    dateReceived: null,
    expirationDate: null,
    noExpiry: false,
    showReceivedMenu: false,
    showExpirationMenu: false
  });
} // addCertification

/**
 * Deletes a certification.
 *
 * @param index - array index of certification to delete
 */
function deleteCertification(index) {
  this.editedCertifications.splice(index, 1);
} // deleteCertification

/**
 * Parse the date after losing focus.
 * @returns String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return this.parseDate(event.target.value);
} //parseEventDate

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesCertifications = _.map(this.employees, (employee) => employee.certifications); // extract certifications
  employeesCertifications = _.compact(employeesCertifications); // remove falsey values
  // loop employees
  _.forEach(employeesCertifications, (certifications) => {
    // loop certifications
    _.forEach(certifications, (certification) => {
      this.certificationDropDown.push(certification.name); // add certification name
    });
  });
} // populateDropDowns

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
  window.EventBus.$emit('doneValidating', 'certifications', this.editedCertifications); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('certificationsStatus', errorCount); // emit error status
} // validateFields

export default {
  computed: {
    isMobile
  },
  created,
  data() {
    return {
      certificationDropDown: [], // autocomplete certification name options
      certificationIndex: 0,
      dateOrderRules: (certIndex) => {
        if (this.editedCertifications) {
          let position = this.editedCertifications[certIndex];
          return !this.isEmpty(position.expirationDate) && moment(position.expirationDate) && position.dateReceived
            ? moment(position.expirationDate).add(1, 'd').isAfter(moment(position.dateReceived)) ||
                'End date must be at or after start date'
            : true;
        } else {
          return true;
        }
      },
      editedCertifications: _.cloneDeep(this.model), // stores edited certifications info
      expDateRule: (compIndex) => {
        if (this.editedCertifications !== undefined) {
          let position = this.editedCertifications[compIndex];
          if (position.noExpiry == false && this.isEmpty(position.expirationDate)) {
            return 'Expiration Date is required';
          } else {
            return true;
          }
        } else {
          return false;
        }
      }
    };
  },
  directives: { mask },
  filters: {
    formatDate
  },
  methods: {
    addCertification,
    deleteCertification,
    getDateOptionalRules,
    getDateRules,
    getRequiredRules,
    isEmpty,
    parseDate,
    parseEventDate,
    populateDropDowns,
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
