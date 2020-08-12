<template>
  <div>
    <!-- Loop customer org exp -->
    <div v-for="(exp, index) in model.customerOrgExp" class="pt-3 pb-1 px-5" :key="'exp: ' + exp.name + index">
      <v-row v-if="index == 0">Current:</v-row>
      <v-row align="center">
        <v-combobox
          v-model="exp.name"
          :rules="requiredRules"
          :items="experienceDropDown"
          label="Customer Organization Experience"
          data-vv-name="Customer Organization Experience"
        >
        </v-combobox>
        <div class="yearsBox">
          <input
            v-model="exp.years"
            type="text"
            oninput="this.value = this.value.replace(/[^0-9]/g, '');"
            maxlength="2"
            :rules="requiredRules"
          />
          <div>years</div>
        </div>
        <!-- Delete button  -->
        <v-slide-x-reverse-transition mode="out-in">
          <v-btn text icon><v-icon @click="deleteExperience(index)">delete</v-icon></v-btn>
        </v-slide-x-reverse-transition>
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
    years: 0,
    current: this.model.customerOrgExp.length == 0
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

<style>
.yearsBox {
  margin-left: 10px;
  border: solid 1px gray;
  width: 70px;
  height: 34px;
  border-radius: 2px;
  font-size: 14px;
  display: flex;
}

.yearsBox div {
  padding-top: 6px;
  margin-left: 4px;
  margin-right: 3px;
}

.yearsBox input {
  outline: none;
  text-align: right;
  width: 33%;
}
</style>
