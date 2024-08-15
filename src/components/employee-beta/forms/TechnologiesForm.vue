<template>
  <div>
    <v-row><h3>Tech and Skills</h3></v-row>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addTechnology()">Add Tech/Skill</v-btn>
      </v-col>
    </v-row>
    <v-row v-for="(technology, index) in editedTechnologies" :key="technology + index" class="d-flex align-center">
      <!-- name -->
      <v-col sm="10" md="8" lg="5">
        <v-autocomplete
          v-model="technology.name"
          label="Tech/Skill"
          :items="dropdownItems"
          :rules="[...getRequiredRules(), ...getDuplicateTechRules(editedTechnologies)]"
          hide-details="auto"
          style="min-width: 180px"
          @update:search="updateDropdownItems($event)"
          @focus="updateDropdownItems()"
        ></v-autocomplete>
      </v-col>

      <!-- MOBILE delete tech/skill -->
      <v-col v-if="isMobile()" sm="2" md="4">
        <v-tooltip text="Delete Tech/Skill" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-delete" variant="text" @click="deleteTechnology(index)"></v-btn>
          </template>
        </v-tooltip>
      </v-col>
      <!-- end MOBILE delete tech/skill -->

      <!-- current -->
      <v-col v-if="!isMobile()" md="4" lg="2">
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

      <!-- number of years -->
      <v-col sm="6" md="4" lg="2">
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

      <!-- number of months -->
      <v-col sm="6" md="4" lg="2">
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

      <!-- NORMAL delete tech/skill -->
      <v-col v-if="!isMobile()" cols="1">
        <v-tooltip text="Delete Tech/Skill" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-delete" variant="text" @click="deleteTechnology(index)"></v-btn>
          </template>
        </v-tooltip>
      </v-col>
      <!-- end NORMAL delete tech/skill -->

      <v-col v-if="isMobile()" cols="12" md="4">
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

      <v-divider v-if="index < editedTechnologies.length - 1" class="border-opacity-25 my-5" thickness="3"></v-divider>
    </v-row>
    <v-row v-if="editedTechnologies.length != 0">
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addTechnology(false)">Add Tech/Skill</v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { usePrepareSubmit } from '@/composables/editTabCommunication';
import api from '@/shared/api';
import { getDuplicateTechRules, getRequiredRules } from '@/shared/validationUtils';
import { isMobile } from '@/utils/utils';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _map from 'lodash/map';
import { ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

// passes in all slot props as a single object
const { slotProps } = defineProps(['slotProps']);
const editedEmployee = ref(slotProps.editedEmployee);
const editedTechnologies = ref(
  _map(slotProps.editedEmployee.technologies, (value) => {
    // adds a 'time' key to each technology, containing an integer value for both years and months
    // omits the 'years' key as the time key replaces it
    return {
      name: value.name,
      time: getYearsAndMonths(value.years),
      current: value.current
    };
  })
);
const dropdownItems = ref([]);

usePrepareSubmit('technologies', prepareSubmit);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

async function prepareSubmit() {
  if (!slotProps.stopPrepare) {
    await slotProps.validate();

    editedEmployee.value.technologies = _map(editedTechnologies.value, (value) => {
      // use old time if same years and months to prevent changing time by less than 1 month increments
      let newYears = Number(value.time.years) + Number(value.time.months) / 12;
      let oldYears = editedEmployee.value.technologies.find((t) => t.name === value.name)?.years;
      let years = _isEqual(getYearsAndMonths(newYears), getYearsAndMonths(Number(oldYears)))
        ? oldYears
        : Number(value.time.months) // store integer year for 0 months
          ? newYears.toFixed(2)
          : Number(newYears);

      return {
        name: value.name,
        years,
        current: value.current
      };
    });
  }
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
  if (!_isEmpty(query)) {
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

  if (addToTop) editedTechnologies.value.unshift(newTech);
  else editedTechnologies.value.push(newTech);
}

function deleteTechnology(index) {
  editedTechnologies.value.splice(index, 1);
}
</script>
