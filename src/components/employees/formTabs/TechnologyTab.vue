<template>
  <div>
    <!-- Loop technologies -->
    <div
      v-for="(technology, index) in model.technologies"
      class="pt-3 pb-1 px-5"
      :key="'technology: ' + technology.name + index"
      style="border: 1px solid grey;"
    >
      <v-row>
        <v-combobox
          v-model="technology.name"
          :rules="requiredRules"
          :items="technologyDropDown"
          label="Technology"
          data-vv-name="Technology"
        >
        </v-combobox>
      </v-row>
      <v-row align="center">
        <v-col>
          <div class="yearsBox">
            <input
              v-model="technology.years"
              type="text"
              oninput="this.value = this.value.replace(/[^0-9]/g, '');"
              maxlength="2"
              :rules="requiredRules"
            />
            <div>years</div>
          </div>
        </v-col>
        <v-col>
          <v-switch v-model="technology.current" label="Current"></v-switch>
        </v-col>
        <!-- Delete button  -->
        <v-slide-x-reverse-transition mode="out-in">
          <v-btn text icon><v-icon @click="deleteTechnology(index)">delete</v-icon></v-btn>
        </v-slide-x-reverse-transition>
      </v-row>
    </div>
    <!-- Add Technology button -->
    <div class="pt-4" align="center">
      <v-btn @click="addTechnology()"><v-icon class="pr-1">add</v-icon>Technology</v-btn>
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
 * Add an technology to the form.
 */
function addTechnology() {
  this.model.technologies.push({
    name: '',
    years: 0,
    current: false
  });
} // addTechnology

/**
 * delete an technology from the form
 */
function deleteTechnology(index) {
  this.model.technologies.splice(index, 1);
} // deleteTechnology

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
  let employeesTechnology = _.map(this.employees, (employee) => employee.technologies); //extract technology
  employeesTechnology = _.compact(employeesTechnology); //remove falsey values
  _.forEach(employeesTechnology, (technologies) => {
    _.forEach(technologies, (technology) => {
      this.technologyDropDown.push(technology.name);
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
      technologyDropDown: [],
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
    addTechnology,
    deleteTechnology,
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
