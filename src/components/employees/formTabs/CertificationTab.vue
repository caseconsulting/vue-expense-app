<template>
  <div>
    <!-- Loop certifications -->
    <div
      v-for="(certification, index) in model.certifications"
      style="border: 1px solid grey;"
      class="pt-3 pb-1 px-5"
      :key="'certification: ' + certification.name + index"
    >
      <v-combobox
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
                :value="formatDate(certification.dateReceived)"
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
                :value="formatDate(certification.expirationDate)"
                label="Expiration Date (optional)"
                prepend-icon="event_busy"
                :rules="dateOptionalRules"
                readonly
                v-bind="attrs"
                v-on="on"
                clearable
                @click:clear="certification.expirationDate = null"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="certification.expirationDate"
              no-title
              @input="certification.showExpirationMenu = false"
            ></v-date-picker>
          </v-menu>
          <!-- End Expiration Date -->
        </v-col>
      </v-row>
    </div>
    <!-- Add certification button -->
    <div class="pt-4" align="center">
      <v-btn @click="addCertification()"><v-icon class="pr-1">add</v-icon>Certification</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

async function created() {
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.getDropDownInfo();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add a certification to the form.
 */
function addCertification() {
  this.model.certifications.push({
    name: null,
    dateReceived: null,
    expirationDate: null,
    showReceivedMenu: false,
    showExpirationMenu: false
  });
} // addCertification

/**
 * delete a certification from the form
 */
function deleteCertification(index) {
  this.model.certifications.splice(index, 1);
} // deleteCertification

function formatDate(date) {
  if (!date) {
    return null;
  }
  const [year, month, day] = date.split('-');
  return `${month}/${day}/${year}`;
} // formatDate

/**
 * Gets information that other employees have filled out.
 */
function getDropDownInfo() {
  let employeesCertifications = _.map(this.employees, (employee) => employee.certifications); //extract certifications
  employeesCertifications = _.compact(employeesCertifications); //remove falsey values
  _.forEach(employeesCertifications, (certifications) => {
    _.forEach(certifications, (certification) => {
      this.certificationDropDown.push(certification.name);
    });
  });
} // getDropDownInfo

/**
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
function parseDate(date) {
  if (!date) {
    return null;
  }
  const [month, day, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // parseDate
}

export default {
  created,
  data() {
    return {
      certificationDropDown: [],
      dateOptionalRules: [
        (v) => {
          return v ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for optional dates
      dateRules: [
        (v) => !!v || 'Date required',
        (v) => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for date
      requiredRules: [
        (v) => !!v || 'This field is required. You must enter information or delete the field if possible'
      ] // rules for required fields
    };
  },
  methods: {
    addCertification,
    deleteCertification,
    formatDate,
    getDropDownInfo,
    parseDate
  },
  props: ['model']
};
</script>
