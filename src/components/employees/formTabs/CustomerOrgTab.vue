<template>
  <div>
    <!-- Loop customer org exp -->
    <div
      v-for="(exp, index) in model.customerOrgExp"
      style="border: 1px solid grey;"
      class="pt-3 pb-1 px-5"
      :key="'exp: ' + exp.name + index"
    >
      <v-combobox
        v-model="exp.name"
        :rules="requiredRules"
        :items="experienceDropDown"
        label="Customer Organization Experience"
        data-vv-name="Customer Organization Experience"
        append-outer-icon="delete"
        @click:append-outer="deleteExperience(index)"
      >
      </v-combobox>

      <v-row>
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Received Date -->
          <v-menu
            v-model="exp.showReceivedMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formatDate(exp.dateReceived)"
                label="Date Received"
                prepend-icon="event_available"
                :rules="dateRules"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="exp.dateReceived" no-title @input="exp.showReceivedMenu = false"></v-date-picker>
          </v-menu>
          <!-- End Received Date -->
        </v-col>
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Expiration Date -->
          <v-menu
            v-model="exp.showExpirationMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                :value="formatDate(exp.expirationDate)"
                label="Expiration Date (optional)"
                prepend-icon="event_busy"
                :rules="dateOptionalRules"
                readonly
                v-bind="attrs"
                v-on="on"
                clearable
                @click:clear="exp.expirationDate = null"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="exp.expirationDate"
              no-title
              @input="exp.showExpirationMenu = false"
            ></v-date-picker>
          </v-menu>
          <!-- End Expiration Date -->
        </v-col>
      </v-row>
    </div>
    <!-- Add Experience button -->
    <div class="pt-4" align="center">
      <v-btn @click="addExperience()"><v-icon class="pr-1">add</v-icon>Experience</v-btn>
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
 * Add an experience to the form.
 */
function addExperience() {
  this.model.customerOrgExp.push({
    name: '',
    dateReceived: null,
    expirationDate: null,
    showReceivedMenu: false,
    showExpirationMenu: false
  });
} // addExperience

/**
 * delete an experience from the form
 */
function deleteExperience(index) {
  this.model.customerOrgExp.splice(index, 1);
} // deleteExperience

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
  let employeesExperiences = _.map(this.employees, (employee) => employee.customerOrgExp); //extract experiences
  employeesExperiences = _.compact(employeesExperiences); //remove falsey values
  _.forEach(employeesExperiences, (experiences) => {
    _.forEach(experiences, (experience) => {
      this.experienceDropDown.push(experience.name);
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
      experienceDropDown: ['DST', 'ADO', 'Talent', 'OMA', 'CCI'],
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
    addExperience,
    deleteExperience,
    formatDate,
    getDropDownInfo,
    parseDate
  },
  props: ['model']
};
</script>
