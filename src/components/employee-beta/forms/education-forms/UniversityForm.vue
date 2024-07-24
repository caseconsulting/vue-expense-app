<template>
  <v-container>
    <v-row>
      <v-col>
        <!-- University -->
        <v-row v-for="i in [0]" :key="i">
          <v-col>
            <v-autocomplete
              ref="formFields"
              v-model="uni.name"
              :rules="getRequiredRules()"
              :items="schoolDropDown"
              label="School"
              data-vv-name="School"
              variant="underlined"
              clearable
            ></v-autocomplete>
          </v-col>
        </v-row>

        <v-row v-for="(degree, dIndex) in uni.degrees" :key="`${dIndex}`">
          <v-col>
            <v-row>
              <v-col>
                <v-select
                  ref="formFields"
                  v-model="degree.degreeType"
                  :rules="getRequiredRules()"
                  :items="degreeDropDown"
                  label="Degree"
                  data-vv-name="Degree"
                  variant="underlined"
                  clearable
                >
                  <template v-if="uni.degrees.length > 1" v-slot:append>
                    <v-btn @click="deleteDegree(dIndex)" variant="text" density="comfortable" icon="">
                      <v-tooltip activator="parent" location="bottom">Delete Degree</v-tooltip>
                      <v-icon :color="caseGray" class="pr-1">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-select>
              </v-col>

              <v-col>
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
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6" v-for="(major, mIndex) in degree.majors" :key="'major: ' + major + mIndex">
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
              </v-col>

              <v-col cols="6" v-for="(minor, minIndex) in degree.minors" :key="'minor ' + minor + minIndex">
                <v-autocomplete
                  ref="formFields"
                  v-model="degree.minors[minIndex]"
                  :rules="[...getRequiredRules(), duplicateDiscipline('minors', minor, dIndex)]"
                  :items="minorDropDown"
                  label="Minor"
                  variant="underlined"
                  data-vv-name="Minor"
                  clearable
                >
                  <template v-slot:append>
                    <v-btn variant="text" icon="" density="comfortable" @click="deleteItem(degree.minors, minIndex)">
                      <v-tooltip activator="parent" location="bottom">Delete Minor</v-tooltip>
                      <v-icon :color="caseGray">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col
                cols="6"
                v-for="(concentration, cIndex) in degree.concentrations"
                :key="'conc: ' + concentration + cIndex"
              >
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
                    <v-btn
                      variant="text"
                      density="comfortable"
                      icon=""
                      @click="deleteItem(degree.concentrations, cIndex)"
                    >
                      <v-tooltip activator="parent" location="bottom">Delete Concentration</v-tooltip>
                      <v-icon :color="caseGray">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="4" align="center">
                <v-btn @click="addItem(degree.majors)" variant="outlined" size="small">Add a Major</v-btn>
              </v-col>

              <v-col cols="4" align="center">
                <v-btn @click="addItem(degree.minors)" variant="outlined" size="small">Add a Minor</v-btn>
              </v-col>

              <v-col cols="4" align="center">
                <v-btn @click="addItem(degree.concentrations)" variant="outlined" size="small"
                  >Add a Concentration</v-btn
                >
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center">
            <v-btn @click="addDegree()" elevation="2">
              <template v-slot:prepend>
                <v-icon :color="caseGray" class="pr-1">mdi-plus</v-icon>
              </template>
              Degree
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import _ from 'lodash';
import { format } from '../../../../shared/dateUtils';
import { onBeforeMount, ref } from 'vue';
import { getDateMonthYearOptionalRules, getRequiredRules } from '../../../../shared/validationUtils';
import { SCHOOLS } from '../../../employees/form-tabs/dropdown-info/schools';
import { useStore } from 'vuex';
import majorsAndMinors from '../../../employees/form-tabs/dropdown-info/majorsAndMinors';
import { mask } from 'vue-the-mask';
import { computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['validating', 'allowAdditions', 'school', 'schoolIndex', 'attach', 'index']);
const store = useStore();
const vMask = mask; // custom directive

const concentrationDropDown = ref(_.map(majorsAndMinors, (elem) => titleCase(elem))); //autocomplete concentration options
const degreeDropDown = ref(['Associates', 'Bachelors', 'Masters', 'PhD/Doctorate', 'Other (trade school, etc)']); // autocomplete degree name opt
const employees = ref(null);
const majorDropDown = ref(_.map(majorsAndMinors, (elem) => titleCase(elem))); // autocomplete major options
const minorDropDown = ref(_.map(majorsAndMinors, (elem) => titleCase(elem))); // autocomplete minor options
const schoolDropDown = SCHOOLS;
const uni = ref(_.cloneDeep(props.school));

const duplicateDiscipline = (title, discipline, degreeIndex) => {
  let disciplines = uni.value.degrees[degreeIndex][title];
  let count = _.countBy(disciplines, (dis) => {
    return dis === discipline;
  });
  return count.true === 1 || 'Duplicate field found, please remove duplicate entries';
};

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(async () => {
  employees.value = store.getters.employees;
  updateDropdowns();
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Determines if the fields are in modals and should be assign the attached prop.
 */
const isAttached = computed(() => {
  return props.attach;
}); // isAttached

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add an empty Degree for a school.
 */
function addDegree() {
  uni.value.degrees.push({
    completionDate: null,
    concentrations: [],
    degreeType: null,
    majors: [null],
    minors: [],
    showEducationMenu: false
  });
} // addDegree

/**
 * Add an empty minor/major/concentration.
 *
 * @param array - array to add item to.
 */
function addItem(array) {
  array.push(null);
} //addItem

/**
 * Deletes a Degree.
 *
 * @param dIndex - array index of degree to delete
 */
function deleteDegree(dIndex) {
  uni.value.degrees.splice(dIndex, 1);
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
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} //parseEventDate

/**
 * Changes the format of the string to title case.
 *
 * @param s - the string to be converted
 * @return string - the title case formatted string
 */
function titleCase(s) {
  let str = String(s);
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
} // titleCase

function updateDropdowns() {
  let employeesMajorsAndMinors = _.map(employees.value, (employee) => {
    let majorsAndMinors = _.map(employee.education, (edu) => {
      if (edu.type === 'university') {
        return _.map(edu.degrees, (degree) => {
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

    return _.flattenDeep(majorsAndMinors);
  });

  //remove empty arrays
  let majorsAndMinors = _.remove(employeesMajorsAndMinors, (degrees) => {
    return degrees.length != 0;
  });

  majorsAndMinors = _.flattenDeep(majorsAndMinors);
  majorsAndMinors = _.compact(majorsAndMinors);

  // //combine with no duplicates
  concentrationDropDown.value = _.uniq([...concentrationDropDown.value, ...majorsAndMinors]);
  majorDropDown.value = _.uniq([...majorDropDown.value, ...majorsAndMinors]);
  minorDropDown.value = _.uniq([...minorDropDown.value, ...majorsAndMinors]);
}
</script>
