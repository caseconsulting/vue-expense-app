<template>
  <v-row class="pa-4">
    <!-- Place of Birth: City text field -->
    <v-text-field v-model="cityModel" hide-details label="City" variant="underlined"></v-text-field>
    <!-- Place of Birth: Country autocomplete -->
    <v-autocomplete
      :items="COUNTRIES"
      v-model="countryModel"
      hide-details
      label="Country"
      variant="underlined"
      class="mx-8"
    ></v-autocomplete>
    <!-- Place of Birth: State autocomplete -->
    <v-autocomplete
      v-if="isUSA()"
      :items="Object.values(STATES)"
      v-model="stateModel"
      hide-details
      label="State"
      variant="underlined"
    ></v-autocomplete>
  </v-row>
</template>

<script setup>
import { STATES, COUNTRIES } from '@/utils/utils';
import { ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const cityModel = ref(props.item['city']);
const countryModel = ref(props.item['country']);
const stateModel = ref(props.item['st']);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

function isUSA() {
  if (countryModel.value === 'United States') {
    return true;
  } else {
    stateModel.value = null;
    return false;
  }
}
</script>
