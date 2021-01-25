<template>
  <div>
    <!-- Loop Certifications -->
    <div
      v-for="(certification, index) in editedCertifications"
      style="border: 1px solid grey"
      class="pt-3 pb-1 px-5"
      :key="'certification: ' + certification.name + index"
    >
      <!-- Name of Certification -->
      <v-combobox
        ref="formFields"
        v-model="certification.name"
        :rules="requiredRules"
        :items="certificationDropDown"
        label="Certification"
        data-vv-name="Certification"
        append-outer-icon="delete"
        @click:append-outer="deleteCertification(index)"
      >
      </v-combobox>

      <v-row>
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
                :value="formatDateDashToSlash(certification.dateReceived)"
                label="Date Received"
                prepend-icon="event_available"
                :rules="dateRules"
                readonly
                v-bind="attrs"
                v-on="on"
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
                :value="formatDateDashToSlash(certification.expirationDate)"
                label="Expiration Date (optional)"
                prepend-icon="event_busy"
                :rules="dateOptionalRules"
                readonly
                v-bind="attrs"
                v-on="on"
                clearable
                hide-details
                @click:clear="certification.expirationDate = null"
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
    </div>
    <!-- End Loop Certifications -->

    <!-- Button to Add Certifications -->
    <div class="pt-4" align="center">
      <v-btn @click="addCertification()"><v-icon class="pr-1">add</v-icon>Certification</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { formatDateDashToSlash, formatDateSlashToDash, isEmpty } from '@/utils/utils';

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
  this.editedCertifications.push({
    name: null,
    dateReceived: null,
    expirationDate: null,
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
  let hasErrors = false;

  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    let error = _.find(this.$refs.formFields, (field) => {
      return !field.validate();
    });
    hasErrors = _.isNil(error) ? false : true;
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }

  window.EventBus.$emit('doneValidating', 'certifications', this.editedCertifications); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('certificationsStatus', hasErrors); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
      certificationDropDown: [], // autocomplete certification name options
      dateOptionalRules: [
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for an optional date
      dateRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for a required date
      editedCertifications: _.cloneDeep(this.model), // stores edited certifications info
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ] // rules for a required field
    };
  },
  methods: {
    addCertification,
    deleteCertification,
    formatDateSlashToDash,
    formatDateDashToSlash,
    isEmpty,
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
