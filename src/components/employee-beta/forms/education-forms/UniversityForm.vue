<template>
  <v-container>
    <v-row>
      <v-col>
        <v-row v-for="i in [0]" :key="i">
          <!-- Start university name -->
          <v-col>
            <v-autocomplete
              ref="formFields"
              v-model="editedEducation[schoolIndex].name"
              :rules="getRequiredRules()"
              :items="schoolDropDown"
              label="School"
              data-vv-name="School"
              clearable
            ></v-autocomplete>
          </v-col>
          <!-- End university name -->
        </v-row>

        <!-- Start degree loop -->
        <v-row v-for="(degree, dIndex) in editedEducation[schoolIndex].degrees" :key="`${dIndex}`">
          <v-col>
            <v-row>
              <!-- Start Degree name -->
              <v-col :cols="isMobile() ? '12' : ''">
                <v-select
                  ref="formFields"
                  v-model="degree.degreeType"
                  :rules="getRequiredRules()"
                  :items="degreeDropDown"
                  label="Degree"
                  data-vv-name="Degree"
                  clearable
                >
                  <template v-if="editedEducation[schoolIndex].degrees.length > 1" v-slot:append>
                    <v-btn @click="deleteDegree(dIndex)" variant="text" density="compact" icon="">
                      <v-tooltip activator="parent">Delete Degree</v-tooltip>
                      <v-icon :color="caseGray" class="pr-1">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-select>
              </v-col>
              <!-- End degree name -->

              <!-- Start degree completion date -->
              <v-col :cols="isMobile() ? '12' : ''">
                <v-text-field
                  ref="formFields"
                  :model-value="format(degree.completionDate, null, 'MM/YYYY')"
                  label="Completion Date"
                  :rules="getDateMonthYearOptionalRules()"
                  hint="MM/YYYY format"
                  v-mask="'##/####'"
                  persistent-hint
                  clearable
                  prepend-inner-icon="mdi-calendar"
                  autocomplete="off"
                  @update:focused="degree.completionDate = parseEventDate()"
                  @keypress="degree.showEducationMenu = false"
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
              <!-- End completion date -->
            </v-row>

            <v-row>
              <!-- Start major loop -->
              <v-col
                :cols="isMobile() ? '12' : '6'"
                v-for="(major, mIndex) in degree.majors"
                :key="'major: ' + major + mIndex"
              >
                <!-- Majors -->
                <v-autocomplete
                  ref="formFields"
                  v-model="degree.majors[mIndex]"
                  :rules="[...getRequiredRules(), duplicateDiscipline('majors', major, dIndex)]"
                  :items="majorDropDown"
                  label="Major"
                  data-vv-name="Major"
                  clearable
                >
                  <template v-slot:append>
                    <v-btn
                      v-if="degree.majors.length > 1"
                      variant="text"
                      icon=""
                      density="compact"
                      @click="deleteItem(degree.majors, mIndex)"
                    >
                      <v-tooltip activator="parent">Delete Major</v-tooltip>
                      <v-icon :color="caseGray">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-autocomplete>
              </v-col>
              <!-- End major loop -->

              <!-- Start minor loop -->
              <v-col
                :cols="isMobile() ? '12' : '6'"
                v-for="(minor, minIndex) in degree.minors"
                :key="'minor ' + minor + minIndex"
              >
                <v-autocomplete
                  ref="formFields"
                  v-model="degree.minors[minIndex]"
                  :rules="[...getRequiredRules(), duplicateDiscipline('minors', minor, dIndex)]"
                  :items="minorDropDown"
                  label="Minor"
                  data-vv-name="Minor"
                  clearable
                >
                  <template v-slot:append>
                    <v-btn variant="text" icon="" density="compact" @click="deleteItem(degree.minors, minIndex)">
                      <v-tooltip activator="parent">Delete Minor</v-tooltip>
                      <v-icon :color="caseGray">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-autocomplete>
              </v-col>
              <!-- End minor loop -->

              <!-- Start concentration loop -->
              <v-col
                :cols="isMobile() ? '12' : '6'"
                v-for="(concentration, cIndex) in degree.concentrations"
                :key="'conc: ' + concentration + cIndex"
              >
                <v-autocomplete
                  ref="formFields"
                  v-model="degree.concentrations[cIndex]"
                  :rules="[...getRequiredRules(), duplicateDiscipline('concentrations', concentration, dIndex)]"
                  :items="concentrationDropDown"
                  data-vv-name="Concentration"
                  clearable
                  label="Concentration"
                >
                  <template v-slot:append>
                    <v-btn variant="text" density="compact" icon="" @click="deleteItem(degree.concentrations, cIndex)">
                      <v-tooltip activator="parent">Delete Concentration</v-tooltip>
                      <v-icon :color="caseGray">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-autocomplete>
              </v-col>
              <!-- End concentration loop -->
            </v-row>

            <v-row>
              <!-- Start add major button -->
              <v-col :cols="!isMobile() ? '5' : '12'" :align="!isMobile() ? 'end' : 'center'">
                <v-btn @click="addItem(degree.majors)" variant="outlined" size="small">Add a Major</v-btn>
              </v-col>
              <!-- End add major button -->

              <!-- Start add minor button -->
              <v-col :cols="!isMobile() ? '2' : '12'" align="center">
                <v-btn @click="addItem(degree.minors)" variant="outlined" size="small">Add a Minor</v-btn>
              </v-col>
              <!-- End add minor button -->

              <!-- Start add concentration button -->
              <v-col :cols="!isMobile() ? '5' : '12'" :align="!isMobile() ? 'start' : 'center'">
                <v-btn @click="addItem(degree.concentrations)" variant="outlined" size="small"
                  >Add a Concentration</v-btn
                >
              </v-col>
              <!-- Start add concentration button -->
            </v-row>
          </v-col>
          <v-divider class="border-opacity-25 mt-5"></v-divider>
        </v-row>
        <!-- End degree loop -->

        <v-row>
          <!-- Start add degree button -->
          <v-col align="center">
            <v-btn @click="addDegree()" elevation="2">
              <template v-slot:prepend>
                <v-icon :color="caseGray" class="pr-1">mdi-plus</v-icon>
              </template>
              Degree
            </v-btn>
          </v-col>
          <!-- End add degreee button -->
        </v-row>
      </v-col>
    </v-row>
    <v-divider class="border-opacity-50 mt-5"></v-divider>
  </v-container>
</template>

<script setup>
import { majorsAndMinors } from '@/components/employees/form-tabs/dropdown-info/majorsAndMinors';
import { SCHOOLS } from '@/components/employees/form-tabs/dropdown-info/schools';
import { format } from '@/shared/dateUtils';
import { getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils';
import { isMobile } from '@/utils/utils';
import _compact from 'lodash/compact';
import _countBy from 'lodash/countBy';
import _flattenDeep from 'lodash/flattenDeep';
import _map from 'lodash/map';
import _remove from 'lodash/remove';
import _uniq from 'lodash/uniq';
import { computed, onBeforeMount, ref } from 'vue';
import { mask } from 'vue-the-mask';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const editedEducation = defineModel({ required: true });
const props = defineProps(['schoolIndex', 'attach']);
const store = useStore();
const vMask = mask; // custom directive

const concentrationDropDown = ref(_map(majorsAndMinors, (elem) => titleCase(elem))); //autocomplete concentration options
const degreeDropDown = ref(['Associates', 'Bachelors', 'Masters', 'PhD/Doctorate', 'Other (trade school, etc)']); // autocomplete degree name opt
const employees = ref(null);
const majorDropDown = ref(_map(majorsAndMinors, (elem) => titleCase(elem))); // autocomplete major options
const minorDropDown = ref(_map(majorsAndMinors, (elem) => titleCase(elem))); // autocomplete minor options
const schoolDropDown = SCHOOLS;

const duplicateDiscipline = (title, discipline, degreeIndex) => {
  let disciplines = editedEducation.value[props.schoolIndex].degrees[degreeIndex][title];
  let count = _countBy(disciplines, (dis) => {
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
  editedEducation.value[props.schoolIndex].degrees.push({
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
  editedEducation.value[props.schoolIndex].degrees.splice(dIndex, 1);
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
  let employeesMajorsAndMinors = _map(employees.value, (employee) => {
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
  });

  //remove empty arrays
  let majorsAndMinors = _remove(employeesMajorsAndMinors, (degrees) => {
    return degrees.length != 0;
  });

  majorsAndMinors = _flattenDeep(majorsAndMinors);
  majorsAndMinors = _compact(majorsAndMinors);

  // //combine with no duplicates
  concentrationDropDown.value = _uniq([...concentrationDropDown.value, ...majorsAndMinors]);
  majorDropDown.value = _uniq([...majorDropDown.value, ...majorsAndMinors]);
  minorDropDown.value = _uniq([...minorDropDown.value, ...majorsAndMinors]);
} // titleCases
</script>
