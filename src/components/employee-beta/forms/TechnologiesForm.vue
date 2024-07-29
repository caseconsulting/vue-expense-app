<template>
  <v-container>
    <v-row><h3>Tech and Skills</h3></v-row>
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
              :rules="[...getRequiredRules(), getDuplicateTechRules()]"
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
          <v-divider class="border-opacity-25"></v-divider>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addTechnology(false)">Add Tech/Skill</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { getRequiredRules } from '@/shared/validationUtils';
import { isEmpty, map } from 'lodash';
import { ref } from 'vue';
import api from '@/shared/api';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const editedEmployee = defineModel();

const technologies = ref(
  map(editedEmployee.value.technologies, (value) => {
    // adds a 'time' key to each technology, containing an integer value for both years and months
    value.time = getYearsAndMonths(value.years);
    return value;
  })
);

const dropdownItems = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function prepareSubmit() {
  editedEmployee.value.technologies = map(technologies.value, (value) => {
    // convert integer months and years back to fractional years
    value.years = value.time.years + value.time.months / 12;
    // remove 'time' key as it's not meant to be stored in the database
    delete value.time;
    return value;
  });
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
 * Gets validation rules for duplicate tech items
 */
function getDuplicateTechRules() {
  return (v) => {
    let count = 0;
    for (let i = 0; i < technologies.value.length && count <= 2; i++) {
      if (technologies.value[i].name === v) count++;
    }
    return count <= 1 || 'Duplicate technology found, please remove duplicate entries';
  };
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
