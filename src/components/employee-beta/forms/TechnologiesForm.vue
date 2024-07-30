<template>
  <v-form ref="form" validate-on="lazy">
    <v-row><h3>Tech & Skills</h3></v-row>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addTechnology()">Add Tech/Skill</v-btn>
      </v-col>
    </v-row>
    <v-row v-for="(technology, index) in technologies" :key="technology + index" class="d-flex align-center">
      <!-- the row in column in row is weird but it works -->
      <v-col>
        <v-row>
          <!-- name -->
          <v-col>
            <v-autocomplete
              v-model="technology.name"
              label="Tech/Skill"
              :items="dropdownItems"
              :rules="[...getRequiredRules(), ...getDuplicateTechRules(technologies)]"
              hide-details="auto"
              style="min-width: 180px"
              @update:search="updateDropdownItems($event)"
              @focus="updateDropdownItems()"
            ></v-autocomplete>
          </v-col>
          <!-- current -->
          <v-col cols="auto">
            <v-tooltip text="Enabling this will automatically increment this skill each month" location="top">
              <template #activator="{ props }">
                <v-switch
                  v-bind="props"
                  v-model="technology.current"
                  label="Currently using"
                  color="primary"
                  style="max-height: 50px"
                ></v-switch>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row class="d-flex align-center">
          <!-- number of years -->
          <v-col>
            <v-text-field
              style="min-width: 100px"
              v-model="technology.time.years"
              suffix="Years"
              type="number"
              min="0"
              max="99"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              style="min-width: 100px"
              v-model="technology.time.months"
              suffix="Months"
              type="number"
              min="0"
              max="12"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <v-col cols="auto">
            <v-tooltip text="Delete Tech/Skill" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-delete" variant="text" @click="deleteTechnology(index)"></v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row v-if="index < technologies.length - 1" class="py-5">
          <v-divider class="border-opacity-25" thickness="3"></v-divider>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addTechnology(false)">Add Tech/Skill</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import api from '@/shared/api';
import { getDuplicateTechRules, getRequiredRules } from '@/shared/validationUtils';
import { isEmpty, map } from 'lodash';
import { inject, onBeforeUnmount, ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');

const editedEmployee = defineModel({ required: true });
const form = ref(null); // template ref

const technologies = ref(
  map(editedEmployee.value.technologies, (value) => {
    // adds a 'time' key to each technology, containing an integer value for both years and months
    // omits the 'years' key as the time key replaces it
    return { name: value.name, time: getYearsAndMonths(value.years), current: value.current };
  })
);
const dropdownItems = ref([]);

defineExpose({ prepareSubmit });

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeUnmount(prepareSubmit);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

async function prepareSubmit() {
  await validate();

  editedEmployee.value.technologies = map(technologies.value, (value) => {
    let years = value.time.years + value.time.months / 12;

    // if years is not an integer
    if (Math.round(years) !== years) {
      // convert to fixed string if it's a float, otherwise leave it as a number
      // this is how the database stores this data initially
      // this needs to be in the same format so that changes can be accurately tracked
      years = years.toFixed(2);
    }
    return {
      name: value.name,
      years,
      current: value.current
    };
  });
}

async function validate() {
  if (form.value) {
    const result = await form.value.validate();
    emitter.emit('validating', { tab: 'technologies', valid: result.valid });
    return result;
  }
  return null;
}

/**
 * Takes in a fractional number of years and returns the integer number of years and months
 *
 * @param {number} years The (possibly) fractional number of years
 * @return {{years: number, months: number}} The integer number of years and months
 */
function getYearsAndMonths(years) {
  const intYears = Math.round(years);
  const intMonths = Math.round((years - intYears) * 12);
  return {
    years: intYears,
    months: intMonths
  };
}

/**
 * Updates the list of suggestions in the dropdown
 *
 * @param {string} query The search query
 */
async function updateDropdownItems(query) {
  if (!isEmpty(query)) {
    try {
      let res = await api.getTechSkills(query);
      dropdownItems.value = res;
    } catch (err) {
      console.error(err);
    }
  } else {
    dropdownItems.value = [];
  }
}

/**
 * Adds a new technology to the list
 *
 * @param {boolean} addToTop Whether to add to the top or bottom of the list
 */
function addTechnology(addToTop = true) {
  const newTech = {
    name: '',
    current: false,
    time: { years: 0, months: 0 }
  };

  if (addToTop) technologies.value.unshift(newTech);
  else technologies.value.push(newTech);
}

function deleteTechnology(index) {
  technologies.value.splice(index, 1);
}
</script>
