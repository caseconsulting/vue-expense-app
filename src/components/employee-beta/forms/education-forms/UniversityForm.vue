<template>
  <div>
    <!-- Start university name -->
    <v-autocomplete
      ref="formFields"
      v-model="editedEducation[schoolIndex].name"
      :rules="getRequiredRules()"
      :items="schoolDropDown"
      label="School"
      data-vv-name="School"
      clearable
    ></v-autocomplete>
    <!-- End university name -->

    <!-- Start degree loop -->
    <div v-for="(degree, dIndex) in editedEducation[schoolIndex].degrees" :key="`${dIndex}`">
      <div>
        <div>
          <!-- Start Degree name -->
          <div>
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
          </div>
          <!-- End degree name -->

          <!-- Start degree completion date -->
          <div :style="xs ? 'max-width: 100%' : ''">
            <date-picker
              v-model="degree.completionDate"
              :rules="getDateMonthYearOptionalRules()"
              variant="filled"
              return-format="YYYY-MM"
              display-format="MM/YYYY"
              label="Completion Date"
              show-adjacent-months
              persistent-hint
              clearable
              hide-actions
              ref="formFields"
            />
          </div>
          <!-- End completion date -->
        </div>

        <!-- majors, minors, concentrations -->
        <div class="majors-container">
          <!-- Start major loop -->
          <div
            v-for="(major, mIndex) in degree.majors"
            :key="'major: ' + major + mIndex"
            :class="{ 'majors-item': !xs, 'majors-item-mobile': xs }"
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
              <!-- if not mobile & more than 1 major -->
              <template #append v-if="!xs && degree.majors.length > 1">
                <v-btn variant="text" icon="" density="compact" @click="deleteItem(degree.majors, mIndex)">
                  <v-tooltip activator="parent">Delete Major</v-tooltip>
                  <v-icon :color="caseGray">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-autocomplete>

            <!-- MOBILE delete button -->
            <div v-if="xs" class="centered-container">
              <v-btn
                prepend-icon="mdi-delete"
                :disabled="degree.majors.length < 2"
                @click="deleteItem(degree.majors, mIndex)"
              >
                Delete Major
              </v-btn>
            </div>
          </div>
          <!-- End major loop -->

          <!-- Start minor loop -->
          <div
            v-for="(minor, minIndex) in degree.minors"
            :key="'minor ' + minor + minIndex"
            :class="{ 'majors-item': !xs, 'majors-item-mobile': xs }"
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
              <template #append v-if="!xs">
                <v-btn variant="text" icon="" density="compact" @click="deleteItem(degree.minors, minIndex)">
                  <v-tooltip activator="parent">Delete Minor</v-tooltip>
                  <v-icon :color="caseGray">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-autocomplete>

            <!-- MOBILE delete button -->
            <div v-if="xs" class="centered-container">
              <v-btn prepend-icon="mdi-delete" @click="deleteItem(degree.minors, minIndex)"> Delete Minor </v-btn>
            </div>
          </div>
          <!-- End minor loop -->

          <!-- Start concentration loop -->
          <div
            v-for="(concentration, cIndex) in degree.concentrations"
            :key="'conc: ' + concentration + cIndex"
            :class="{ 'majors-item': !xs, 'majors-item-mobile': xs }"
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
              <template #append v-if="!xs">
                <v-btn variant="text" density="compact" icon="" @click="deleteItem(degree.concentrations, cIndex)">
                  <v-tooltip activator="parent">Delete Concentration</v-tooltip>
                  <v-icon :color="caseGray">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-autocomplete>

            <!-- MOBILE delete button -->
            <div v-if="xs" class="centered-container">
              <v-btn
                prepend-icon="mdi-delete"
                style="overflow-x: clip; justify-content: left"
                @click="deleteItem(degree.concentrations, cIndex)"
              >
                <span style="text-wrap: wrap"> Delete Concentration </span>
              </v-btn>
            </div>
          </div>
          <!-- End concentration loop -->
        </div>

        <div style="height: 16px; width: 100%" />

        <!-- mobile (small screens): stack buttons vertically -->
        <div v-if="xs" id="add-majors-container-mobile">
          <v-btn
            style="width: fit-content"
            @click="addItem(degree.majors)"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
            >Major</v-btn
          >

          <v-btn
            style="width: fit-content"
            @click="addItem(degree.minors)"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
            >Minor</v-btn
          >

          <v-btn
            style="width: fit-content"
            @click="addItem(degree.concentrations)"
            variant="outlined"
            size="small"
            prepend-icon="mdi-plus"
            >Concentration</v-btn
          >
        </div>

        <!-- not mobile: justify buttons to center -->
        <div v-else id="add-majors-container">
          <div id="add-major-container">
            <v-btn @click="addItem(degree.majors)" variant="outlined" size="small">Add a Major</v-btn>
          </div>

          <div id="add-minor-container">
            <v-btn @click="addItem(degree.minors)" variant="outlined" size="small">Add a Minor</v-btn>
          </div>

          <div id="add-concentration-container">
            <v-btn @click="addItem(degree.concentrations)" variant="outlined" size="small">Add a Concentration</v-btn>
          </div>
        </div>
      </div>

      <div style="width: 100%">
        <v-divider length="80%" opacity="30%" class="my-4" style="justify-self: center" />
      </div>
    </div>

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
  </div>
</template>

<script setup>
import DatePicker from '@/components/shared/DatePicker.vue'
import { majorsAndMinors } from '@/components/employees/form-tabs/dropdown-info/majorsAndMinors';
import { SCHOOLS } from '@/components/employees/form-tabs/dropdown-info/schools';
import { format } from '@/shared/dateUtils';
import { getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils';
import _compact from 'lodash/compact';
import _countBy from 'lodash/countBy';
import _flattenDeep from 'lodash/flattenDeep';
import _map from 'lodash/map';
import _remove from 'lodash/remove';
import _uniq from 'lodash/uniq';
import { computed, onBeforeMount, ref } from 'vue';
import { mask } from 'vue-the-mask';
import { useDisplay } from 'vuetify/lib/framework.mjs';
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
const { xs } = useDisplay();

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

<style scoped>
/* A container that completely centers the items within it */
.centered-container {
  display: flex;
  place-items: center;
  justify-content: space-around;
}

/* Container for majors, minors, concentrations */
.majors-container {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  place-items: center left;
  gap: 16px;
}

/* An item in the majors-container (i.e. a text field and delete button) */
.majors-item {
  flex: 1 1 auto;
  min-width: 160px;
  max-width: 50%;
}

.majors-item-mobile {
  flex: 1 1 auto;
  min-width: 160px;
  max-width: 100%;
}

/* Container for the add-major, add-minor, add-concentration buttons */
#add-majors-container {
  display: flex;
  flex-flow: row nowrap;
  gap: 16px;
  place-items: center;
}

#add-majors-container-mobile {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  gap: 16px;
  place-items: center;
}

#add-major-container {
  flex-grow: 1;
  display: flex;
  justify-content: end;
}

#add-minor-container {
  flex-grow: 0;
  width: fit-content;
}

#add-concentration-container {
  flex-grow: 1;
  display: flex;
  justify-content: start;
}
</style>
