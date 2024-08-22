<template>
  <div>
    <!-- Loop Certifications -->
    <div v-for="(certification, index) in editedCertifications" class="gray-border ma-0 pt-3 pb-1 px-5" :key="index">
      <!-- Name of Certification -->
      <v-combobox
        ref="formFields"
        v-model="certification.name"
        :rules="getRequiredRules()"
        :items="certificationDropDown"
        label="Certification"
        variant="underlined"
        data-vv-name="Certification"
        clearable
      >
      </v-combobox>
      <v-row class="pt-3">
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Received Date -->
          <v-text-field
            ref="formFields"
            :model-value="format(certification.dateReceived, null, 'MM/DD/YYYY')"
            label="Date Received"
            :rules="[...getDateRules()]"
            hint="MM/DD/YYYY format"
            v-mask="'##/##/####'"
            variant="underlined"
            prepend-icon="mdi-calendar"
            @update:focused="certification.dateReceived = parseEventDate()"
            @focus="certificationIndex = index"
            @click:prepend="certification.showReceivedMenu = true"
            @keypress="certification.showReceivedMenu = false"
            clearable
            autocomplete="off"
          >
            <v-menu
              activator="parent"
              v-model="certification.showReceivedMenu"
              :close-on-content-click="false"
              location="start center"
            >
              <v-date-picker
                v-model="certification.dateReceived"
                :max="certification.expirationDate"
                @update:model-value="certification.showReceivedMenu = false"
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
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Expiration Date -->
          <v-text-field
            ref="formFields"
            :model-value="format(certification.expirationDate, null, 'MM/DD/YYYY')"
            label="Expiration Date (optional)"
            :rules="[...getDateOptionalRules(), dateOrderRules(index)]"
            hint="MM/DD/YYYY format"
            v-mask="'##/##/####'"
            variant="underlined"
            clearable
            prepend-icon="mdi-calendar"
            @update:focused="certification.expirationDate = parseEventDate()"
            @click:prepend="certification.showExpirationMenu = true"
            @keypress="certification.showExpirationMenu = false"
            @focus="certificationIndex = index"
            autocomplete="off"
          >
            <v-menu
              activator="parent"
              v-model="certification.showExpirationMenu"
              :close-on-content-click="false"
              location="start center"
            >
              <v-date-picker
                v-model="certification.expirationDate"
                :min="certification.dateReceived"
                @update:model-value="certification.showExpirationMenu = false"
                show-adjacent-months
                hide-actions
                keyboard-icon=""
                color="#bc3825"
                title="Expiration Date"
              ></v-date-picker>
            </v-menu>
          </v-text-field>
          <!-- End Expiration Date -->
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" align="center" justify="center" class="pb-4 mb-2">
          <v-btn @click="deleteCertification(index)" icon variant="text">
            <v-tooltip activator="parent" location="bottom">Delete Certification</v-tooltip>
            <v-icon class="case-gray">mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <!-- End Loop Certifications -->

    <!-- Button to Add Certifications -->
    <div class="pt-4" align="center">
      <v-btn @click="addCertification()" elevation="2">
        <v-icon class="pr-1">mdi-plus</v-icon>
        Certification
      </v-btn>
    </div>
  </div>
</template>

<script>
import _map from 'lodash/map';
import _compact from 'lodash/compact';
import _forEach from 'lodash/forEach';
import _isArray from 'lodash/isArray';
import _cloneDeep from 'lodash/cloneDeep';
import { getDateRules, getDateOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { asyncForEach, isEmpty, isMobile } from '@/utils/utils';
import { add, format, getTodaysDate, isAfter } from '@/shared/dateUtils';
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
  this.emitter.emit('created', 'certifications'); // emit certifications tab was created
  this.employees = this.$store.getters.employees; // get all employees
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
    dateSubmitted: getTodaysDate(),
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
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return this.format(event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD');
} //parseEventDate

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesCertifications = _map(this.employees, (employee) => employee.certifications); // extract certifications
  employeesCertifications = _compact(employeesCertifications); // remove falsey values
  // loop employees
  _forEach(employeesCertifications, (certifications) => {
    // loop certifications
    _forEach(certifications, (certification) => {
      this.certificationDropDown.push(certification.name); // add certification name
    });
  });
} // populateDropDowns

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
  this.emitter.emit('doneValidating', { tab: 'certifications', data: this.editedCertifications }); // emit done validating and sends edited data back to parent
  this.emitter.emit('certificationsStatus', errorCount); // emit error status
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields.
 *
 * @param val - val prop that needs to exist before validating
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
          if (!this.isEmpty(position.expirationDate) && position.dateReceived) {
            return (
              isAfter(add(position.expirationDate, 1, 'd'), position.dateReceived) ||
              'Expiration date must be at or after date received'
            );
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      dateSubmitted: getTodaysDate(),
      editedCertifications: _cloneDeep(this.model) // stores edited certifications info
    };
  },
  directives: { mask },
  methods: {
    add,
    addCertification,
    deleteCertification,
    format,
    getDateOptionalRules,
    getDateRules,
    getTodaysDate,
    getRequiredRules,
    isAfter,
    isEmpty,
    parseEventDate,
    populateDropDowns,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
