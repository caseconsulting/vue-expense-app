<template>
  <div>
    <div
      class="py-3 px-5"
      style="border: 1px solid grey;"
      v-for="(degree, index) in model.degrees"
      :key="'degree: ' + degree.name + index"
    >
      <v-combobox
        v-model="degree.name"
        :rules="requiredRules"
        :items="degreeDropDown"
        label="Degree"
        data-vv-name="Degree"
      >
        <!-- Delete button  -->
        <template v-slot:append-outer>
          <v-slide-x-reverse-transition mode="out-in">
            <v-icon @click="deleteDegree(index)">delete</v-icon>
          </v-slide-x-reverse-transition>
        </template>
      </v-combobox>
      <v-combobox
        v-model="degree.school"
        :rules="requiredRules"
        :items="schoolDropDown"
        label="School"
        data-vv-name="School"
      ></v-combobox>
      <!-- Month and Year of Completion -->
      <v-menu
        v-model="degree.showEducationMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            :value="degree.date"
            label="Completion Date"
            prepend-icon="event"
            :rules="dateRules"
            readonly
            hint="YYYY-MM format"
            persistent-hint
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="degree.date"
          no-title
          @input="degree.showEducationMenu = false"
          type="month"
        ></v-date-picker>
      </v-menu>
      <div v-for="(major, index) in degree.majors" :key="'major: ' + major + index">
        <v-combobox
          v-model="degree.majors[index]"
          :rules="requiredRules"
          :items="majorDropDown"
          label="Major"
          data-vv-name="Major"
        >
          <!-- Delete button  -->
          <template v-slot:append-outer>
            <v-slide-x-reverse-transition mode="out-in">
              <v-icon v-if="index > 0" @click="deleteItem(degree.majors, index)">delete</v-icon>
            </v-slide-x-reverse-transition>
          </template>
        </v-combobox>
      </div>
      <div align="center" class="pb-4">
        <v-btn @click="addItem(degree.majors)" depressed outlined small color="#3f3f3c">Add a Major</v-btn>
      </div>
      <div v-for="(minor, index) in degree.minors" :key="'minor: ' + minor + index">
        <v-combobox
          v-model="degree.minors[index]"
          :rules="requiredRules"
          :items="minorDropDown"
          label="Minor"
          data-vv-name="Minor"
        >
          <!-- Delete button  -->
          <template v-slot:append-outer>
            <v-slide-x-reverse-transition mode="out-in">
              <v-icon @click="deleteItem(degree.minors, index)">delete</v-icon>
            </v-slide-x-reverse-transition>
          </template>
        </v-combobox>
      </div>
      <div align="center" class="pb-4">
        <v-btn @click="addItem(degree.minors)" depressed outlined small color="#3f3f3c">Add a Minor</v-btn>
      </div>
      <!-- Concentration -->
      <div v-for="(concentration, index) in degree.concentrations" :key="'conc: ' + concentration + index">
        <v-combobox
          v-model="degree.concentrations[index]"
          :rules="requiredRules"
          :items="concentrationDropDown"
          label="Concentration"
          data-vv-name="Concentration"
        >
          <!-- Delete button  -->
          <template v-slot:append-outer>
            <v-slide-x-reverse-transition mode="out-in">
              <v-icon @click="deleteItem(degree.concentrations, index)">delete</v-icon>
            </v-slide-x-reverse-transition>
          </template>
        </v-combobox>
      </div>
      <div align="center" class="pb-4">
        <v-btn @click="addItem(degree.concentrations)" depressed outlined small color="#3f3f3c"
          >Add a Concentration</v-btn
        >
      </div>
      <!-- End Concentration -->
    </div>
    <div class="pt-4" align="center">
      <v-btn @click="addDegree()"><v-icon class="pr-1">add</v-icon>Degree</v-btn>
    </div>
    <!-- Completion year -->
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
 * Add a degree to the form.
 */
function addDegree() {
  this.model.degrees.push({
    concentrations: [],
    date: null,
    majors: [''],
    minors: [],
    name: '',
    school: '',
    showEducationMenu: false
  });
} // addDegree

/**
 * Add minor/major/concentration
 */
function addItem(array) {
  array.push('');
} //addItem

/**
 * delete minor/major/concentration
 */
function deleteItem(array, index) {
  array.splice(index, 1);
} // deleteItem

/**
 * delete a degree from the form
 */
function deleteDegree(index) {
  this.model.degrees.splice(index, 1);
} // deleteDegree

/**
 * Gets information that other employees have filled out.
 */
function getDropDownInfo() {
  let employeesDegrees = _.map(this.employees, (employee) => employee.degrees); //extract contracts
  employeesDegrees = _.compact(employeesDegrees); //remove falsey values
  _.forEach(employeesDegrees, (degrees) => {
    _.forEach(degrees, (degree) => {
      this.degreeDropDown.push(degree.name);
      this.schoolDropDown.push(degree.school);
      _.forEach(degree.majors, (major) => {
        this.majorDropDown.push(major);
      });
      _.forEach(degree.minors, (minor) => {
        this.minorDropDown.push(minor);
      });
      _.forEach(degree.concentrations, (conc) => {
        this.concentrationDropDown.push(conc);
      });
    });
  });
} // getDropDownInfo

export default {
  created,
  data() {
    return {
      concentrationDropDown: [],
      dateRules: [
        (v) => !!v || 'Date must be valid. Format: YYYY-MM',
        (v) => (!!v && /^\d{4}[-](0?[1-9]|1[0-2])$/.test(v)) || 'Date must be valid. Format: YYYY-MM'
      ], // rules for dates
      degreeDropDown: [],
      majorDropDown: [],
      minorDropDown: [],
      requiredRules: [
        (v) => !!v || 'This field is required. You must enter information or delete the field if possible.'
      ], // rules for required fields
      schoolDropDown: []
    };
  },
  methods: {
    addDegree,
    addItem,
    deleteDegree,
    deleteItem,
    getDropDownInfo
  },
  props: ['model']
};
</script>
