<template>
  <div>
    <v-row><h3>Tech and Skills</h3></v-row>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addTechnology()">Add Tech/Skill</v-btn>
      </v-col>
    </v-row>

    <!-- List of technologies -->
    <v-divider class="border-opacity-25 my-5" thickness="3"></v-divider>
    <v-row v-for="(technology, index) in editedTechnologies" :key="technology + index" class="d-flex align-center">
      <!-- name -->
      <v-col sm="12" md="8" lg="5">
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

      <!--
        current toggle:
        if screen is medium, place between time and delete button
        (so that toggle and delete button are stacked)
      -->
      <v-col v-if="md" cols="4">
        <v-tooltip text="Automatically increment this skill each month" location="top">
          <template #activator="{ props }">
            <div class="switch-container">
              <v-switch v-bind="props" v-model="technology.current" color="primary" hide-details="auto" />

              <div class="word-wrap-only">Currently using</div>
            </div>
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

      <!--
        current toggle:
        if screen is not medium, place between time and delete button
        (vertically stacked with delete button, but below input fields)
      -->
      <v-col v-if="!md" lg="2" sm="12">
        <v-tooltip text="Automatically increment this skill each month" location="top">
          <template #activator="{ props }">
            <div class="switch-container">
              <v-switch v-bind="props" v-model="technology.current" color="primary" hide-details="auto" />

              <div class="word-wrap-only">Currently using</div>
            </div>
          </template>
        </v-tooltip>
      </v-col>

      <!-- delete button -->
      <v-col :class="{ 'delete-container-mobile': smAndDown }">
        <v-tooltip text="Delete Tech/Skill" location="top">
          <template #activator="{ props }">
            <!-- on mobile: -->
            <div v-if="smAndDown" class="flex-grow-1 delete-btn-container-mobile">
              <v-btn v-bind="props" prepend-icon="mdi-delete" @click="deleteTechnology(index)">Delete</v-btn>
            </div>

            <!-- not on mobile -->
            <v-btn
              v-else
              v-bind="props"
              class="flex-grow-1"
              icon="mdi-delete"
              variant="text"
              @click="deleteTechnology(index)"
            />
          </template>
        </v-tooltip>
      </v-col>

      <v-divider v-if="index < editedTechnologies.length" class="border-opacity-25 my-5" thickness="3"></v-divider>
    </v-row>
    <!-- End list of technologies -->

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
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _map from 'lodash/map';
import { ref } from 'vue';
import { useDisplay } from 'vuetify/lib/framework.mjs';

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

const { smAndDown, md } = useDisplay();
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

<style>
/**
 * Ensures that text only wraps on spaces, preventing that thing where there's a single character on each line. If the
 * screen isn't big enough it'll just overflow
 */
.word-wrap-only {
  overflow-wrap: normal;
}

/* Flex container for switch and "Currently using" text */
.switch-container {
  width: 100%;
  margin: 0;
  display: flex;
  flex-flow: row wrap;
  place-items: center left;
  justify-content: center;
  gap: 4px;
}

/* Helps align/format the v-col that contains the button */
.delete-container-mobile {
  display: flex;
  justify-content: space-around;
  justify-items: center;
}

/* Helps align the button within the container */
.delete-btn-container-mobile {
  display: flex;
  justify-content: space-around;
  justify-items: center;
}
</style>
