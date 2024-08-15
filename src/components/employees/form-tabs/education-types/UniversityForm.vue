<template>
  <div :class="parser ? 'gray-border py-3' : ''">
    <div v-for="i in [0]" :key="i">
      <!-- Name of School -->
      <v-autocomplete
        ref="formFields"
        v-model="uni.name"
        :rules="getRequiredRules()"
        :items="schoolDropDown"
        label="School"
        variant="underlined"
        data-vv-name="School"
        clearable
      ></v-autocomplete>
      <div v-for="(degree, dIndex) in uni.degrees" :key="`${dIndex}`">
        <!-- Name of Degree -->

        <v-select
          ref="formFields"
          v-model="degree.degreeType"
          :rules="getRequiredRules()"
          :items="degreeDropDown"
          label="Degree"
          variant="underlined"
          data-vv-name="Degree"
          clearable
        >
          <template v-if="uni.degrees.length > 1" v-slot:append>
            <v-btn @click="deleteDegree(dIndex)" variant="text" density="comfortable" icon="">
              <v-tooltip activator="parent" location="bottom">Delete Degree</v-tooltip>
              <v-icon :color="caseGray" class="pr-1">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-select>

        <!-- Month and Year of Completion -->
        <v-text-field
          ref="formFields"
          :model-value="format(degree.completionDate, null, 'MM/YYYY')"
          label="Completion Date"
          :rules="getDateMonthYearOptionalRules()"
          hint="MM/YYYY format"
          v-mask="'##/####'"
          variant="underlined"
          persistent-hint
          @update:focused="degree.completionDate = parseEventDate($event)"
          clearable
          prepend-icon="mdi-calendar"
          @click:prepend="degree.showEducationMenu = true"
          @keypress="degree.showEducationMenu = false"
          autocomplete="off"
        >
          <v-menu
            activator="parent"
            v-model="degree.showEducationMenu"
            :close-on-content-click="false"
            :attach="isAttached"
            location="start center"
          >
            <v-date-picker
              v-model="degree.completionDate"
              @update:model-value="degree.showEducationMenu = false"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="Completion Date"
            ></v-date-picker>
          </v-menu>
        </v-text-field>
        <!-- End Month and Year of Completion -->

        <!-- Majors -->
        <!-- Loop Majors -->
        <div v-for="(major, mIndex) in degree.majors" :key="'major: ' + major + mIndex">
          <!-- Majors -->
          <v-autocomplete
            ref="formFields"
            v-model="degree.majors[mIndex]"
            :rules="[...getRequiredRules(), duplicateDiscipline('majors', major, dIndex)]"
            :items="majorDropDown"
            label="Major"
            variant="underlined"
            data-vv-name="Major"
            clearable
          >
            <template v-slot:append>
              <v-btn
                v-if="degree.majors.length > 1"
                variant="text"
                icon=""
                density="comfortable"
                @click="deleteItem(degree.majors, mIndex)"
              >
                <v-tooltip activator="parent" location="bottom">Delete Major</v-tooltip>
                <v-icon :color="caseGray">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-autocomplete>
        </div>
        <!-- End Loop Majors -->
        <!-- Button to Add Major -->
        <div align="center" class="py-2">
          <v-btn @click="addItem(degree.majors)" variant="outlined" size="small">Add a Major</v-btn>
        </div>
        <!-- End Majors -->

        <!-- Minors -->
        <!-- Loops Minors -->
        <div v-for="(minor, mIndex) in degree.minors" :key="'minor: ' + minor + mIndex">
          <v-autocomplete
            ref="formFields"
            v-model="degree.minors[mIndex]"
            :rules="[...getRequiredRules(), duplicateDiscipline('minors', minor, dIndex)]"
            :items="minorDropDown"
            label="Minor"
            variant="underlined"
            data-vv-name="Minor"
            clearable
          >
            <template v-slot:append>
              <v-btn variant="text" icon="" density="comfortable" @click="deleteItem(degree.minors, mIndex)">
                <v-tooltip activator="parent" location="bottom">Delete Minor</v-tooltip>
                <v-icon :color="caseGray">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-autocomplete>
        </div>
        <!-- End Loops Minors -->
        <!-- Button to Add Minor -->
        <div align="center" class="py-2">
          <v-btn @click="addItem(degree.minors)" variant="outlined" size="small">Add a Minor</v-btn>
        </div>
        <!-- End Minors -->

        <!-- Concentrations -->
        <!-- Loop Concentrations -->
        <div v-for="(concentration, cIndex) in degree.concentrations" :key="'conc: ' + concentration + cIndex">
          <v-autocomplete
            ref="formFields"
            v-model="degree.concentrations[cIndex]"
            :rules="[...getRequiredRules(), duplicateDiscipline('concentrations', concentration, dIndex)]"
            :items="concentrationDropDown"
            variant="underlined"
            data-vv-name="Concentration"
            clearable
            label="Concentration"
          >
            <template v-slot:append>
              <v-btn variant="text" density="comfortable" icon="" @click="deleteItem(degree.concentrations, cIndex)">
                <v-tooltip activator="parent" location="bottom">Delete Concentration</v-tooltip>
                <v-icon :color="caseGray">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-autocomplete>
        </div>
        <!-- End Loop Concentrations -->
        <!-- Button to Add Concentration -->
        <div align="center" class="py-2">
          <v-btn @click="addItem(degree.concentrations)" variant="outlined" size="small">Add a Concentration</v-btn>
        </div>
        <!-- End Concentrations -->
      </div>
      <!-- Button to Add Degrees -->
      <div class="pt-2" align="center">
        <v-btn @click="addDegree()" elevation="2">
          <template v-slot:prepend>
            <v-icon :color="caseGray" class="pr-1">mdi-plus</v-icon>
          </template>
          Degree
        </v-btn>
      </div>
    </div>
    <!-- Resume Parser Buttons -->
    <div v-if="parser" class="center">
      <v-btn icon="" variant="text">
        <v-tooltip activator="parent" location="top">Ignore Pending Change</v-tooltip>
        <v-icon size="large" color="red" @click="emitToParser(false)">mdi-close</v-icon>
      </v-btn>
      <v-btn icon="" variant="text">
        <v-tooltip activator="parent" location="top">Add Pending Change</v-tooltip>
        <v-icon size="large" color="green" @click="emitToParser(true)">mdi-check</v-icon>
      </v-btn>
    </div>
  </div>
  <!-- End Loop Education -->
</template>

<script>
import _isEmpty from 'lodash/isEmpty';
import _isArray from 'lodash/isArray';
import _map from 'lodash/map';
import _uniq from 'lodash/uniq';
import _flattenDeep from 'lodash/flattenDeep';
import _remove from 'lodash/remove';
import _compact from 'lodash/compact';
import _countBy from 'lodash/countBy';
import _cloneDeep from 'lodash/cloneDeep';
import { getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { format } from '@/shared/dateUtils';
import { mask } from 'vue-the-mask';
import { asyncForEach } from '@/utils/utils';
import { SCHOOLS } from '../dropdown-info/schools';
import { majorsAndMinors } from '../dropdown-info/majorsAndMinors';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  //update drop downs with majors and minors not on the list
  this.updateDropdowns();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits confirmation to resume parser.
 *
 * @param include - whether or not to include this education
 */
function emitToParser(include) {
  this.emitter.emit(include ? 'confirm' : 'deny', {
    index: this.schoolIndex,
    value: include ? this.uni : undefined
  });
} // emitToParser

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return this.format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} //parseEventDate

/**
 * Add an empty minor/major/concentration.
 *
 * @param array - array to add item to.
 */
function addItem(array) {
  array.push(null);
} //addItem

/**
 * Add an empty Degree for a school.
 */
function addDegree() {
  this.uni.degrees.push({
    completionDate: null,
    concentrations: [],
    degreeType: null,
    majors: [null],
    minors: [],
    showEducationMenu: false
  });
} // addDegree

/**
 * Deletes a Degree.
 *
 * @param dIndex - array index of degree to delete
 */
function deleteDegree(dIndex) {
  this.uni.degrees.splice(dIndex, 1);
} // deleteDegree

/**
 * Deletes a minor/major/concentration.
 *
 * @param array - array to remove item from.
 * @param index - array index of item to delete
 */
function deleteItem(array, index) {
  array.splice(index, 1);
} // deleteItem

/**
 * Uses the last saved school as a placeholder for the dropdown until the API loads.
 *
 * @param schoolName - value of the last saved school
 * @returns one-item array or result of getColleges API call
 */
function schoolNamePlaceholder(schoolName) {
  return _isEmpty(this.schoolDropDown) ? [schoolName] : this.schoolDropDown;
} // confirmEducation

/**
 * Changes the format of the string to title case.
 *
 * @param str - the string to be converted
 * @return string - the title case formatted string
 */
function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
} // titleCase

/**
 * updates the dropdowns with employee data.
 */
function updateDropdowns() {
  let employeesMajorsAndMinors = _map(this.employees, (employee) => {
    let majorsAndMinors = _map(employee.education, (edu) => {
      if (edu.type === 'university') {
        return _map(edu.degrees, (degree) => {
          if (degree.majors && degree.minors) {
            return degree.majors.concat(degree.minors);
          } else if (degree.majors) {
            return degree.majors;
          } else {
            return degree.minors;
          }
        });
      }
    });

    return _flattenDeep(majorsAndMinors);
  }); //extract technology

  //remove empty arrays
  let majorsAndMinors = _remove(employeesMajorsAndMinors, (degrees) => {
    return degrees.length != 0;
  });

  majorsAndMinors = _flattenDeep(majorsAndMinors);
  majorsAndMinors = _compact(majorsAndMinors);

  // //combine with no duplicates
  this.concentrationDropDown = _uniq([...this.concentrationDropDown, ...majorsAndMinors]);
  this.majorDropDown = _uniq([...this.majorDropDown, ...majorsAndMinors]);
  this.minorDropDown = _uniq([...this.minorDropDown, ...majorsAndMinors]);
} // updateDropdowns

/**
 * Validate all input fields are valid.
 */
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) errorCount++;
  });
  this.emitter.emit('doneValidatingEducation', {
    content: this.uni,
    index: this.schoolIndex,
    errors: errorCount
  }); // emit done validating
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Determines if the fields are in modals and should be assign the attached prop.
 */
function isAttached() {
  return this.attach;
} // isAttached

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields
 */
function watchValidating() {
  if (this.validating) this.validateFields();
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
      concentrationDropDown: _map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete concentration options
      duplicateDiscipline: (title, discipline, degreeIndex) => {
        let disciplines = this.uni.degrees[degreeIndex][title];
        let count = _countBy(disciplines, (dis) => {
          return dis === discipline;
        });
        return count.true === 1 || 'Duplicate field found, please remove duplicate entries';
      },
      uni: _cloneDeep(this.$props.school),
      degreeDropDown: ['Associates', 'Bachelors', 'Masters', 'PhD/Doctorate', 'Other (trade school, etc)'], // autocomplete degree name options
      majorDropDown: _map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete major options
      minorDropDown: _map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete minor options
      schoolDropDown: SCHOOLS // autocomplete school options
    };
  },
  directives: { mask },
  computed: {
    isAttached
  },
  methods: {
    emitToParser,
    format,
    getDateMonthYearOptionalRules,
    getRequiredRules,
    parseEventDate,
    addItem,
    addDegree,
    deleteDegree,
    deleteItem,
    schoolNamePlaceholder,
    titleCase,
    updateDropdowns,
    validateFields
  },
  //Education index is only used in the resume parser
  props: ['parser', 'validating', 'allowAdditions', 'school', 'schoolIndex', 'attach', 'index'],
  watch: {
    validating: watchValidating
  }
};
</script>
