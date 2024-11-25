<template>
  <div>
    <!-- Place of Birth: City text field -->
    <v-text-field
      v-model="cityModel"
      autofocus
      hide-details
      label="City"
      variant="underlined"
      class="d-inline-block field"
      @update:modelValue="searchCity($event)"
    >
      <v-menu target="parent" v-model="showMenu" location="bottom">
        <v-list
          v-if="predictions.length > 0"
          :items="predictions"
          @click:select="predictionSelected($event)"
          rounded="0"
        >
        </v-list>
        <v-list v-if="predictions.length > 0" @click.stop rounded="0" class="d-flex align-center">
          <span class="text-caption text-grey ml-2">powered by</span>
          <v-img :src="google" width="50" alt="Github icon" inline class="ml-1" />
        </v-list>
      </v-menu>
    </v-text-field>
    <!-- Place of Birth: Country autocomplete -->
    <v-autocomplete
      :items="COUNTRIES"
      v-model="countryModel"
      hide-details
      label="Country"
      variant="underlined"
      class="d-inline-block field mx-8"
    ></v-autocomplete>
    <!-- Place of Birth: State autocomplete -->
    <v-autocomplete
      v-if="isUSA()"
      :items="Object.values(STATES)"
      v-model="stateModel"
      hide-details
      label="State"
      variant="underlined"
      class="d-inline-block field"
    ></v-autocomplete>
  </div>
</template>

<script setup>
import { STATES, COUNTRIES } from '@/utils/utils';
import { inject, ref, watch } from 'vue';
import google from '@/assets/img/trademarks/google.png';
import _forEach from 'lodash/forEach';
import _find from 'lodash/find';
import api from '@/shared/api.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');

const cityModel = ref(props.item['city']);
const countryModel = ref(props.item['country']);
const stateModel = ref(props.item['st']);
const showMenu = ref(false);
const predictions = ref([]); // to hold all predictions made by google

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [cityModel.value, countryModel.value, stateModel.value],
  () => {
    emitter.emit('update-item', {
      field: props.field,
      item: { ...props.item, city: cityModel.value, country: countryModel.value, st: stateModel.value }
    });
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

function isUSA() {
  if (countryModel.value === 'United States' || countryModel.value === 'USA') {
    return true;
  } else {
    stateModel.value = null;
    return false;
  }
}

async function searchCity(query) {
  predictions.value = [];
  let predictionsSet = new Set(); // to prevent duplicate cities
  if (query?.length > 2) {
    showMenu.value = true;
    let locations = await api.getCity(query);
    _forEach(locations.predictions, (location) => {
      predictionsSet.add({ title: location.description, value: location.place_id });
    });
    predictions.value = [...predictionsSet];
  } else {
    showMenu.value = false;
  }
}

async function predictionSelected(event) {
  let prediction = _find(predictions.value, { value: event.id });
  let country = '';
  let state = '';

  let birthInfo = prediction.title.split(', ');
  let city = birthInfo[0];

  // a city outside the US with no state/region
  if (birthInfo.length == 2) {
    country = birthInfo[1];
  } else {
    state = birthInfo[1];
    country = birthInfo[2];
  }

  if (country === 'USA') {
    country = 'United States';
  }
  cityModel.value = city;
  stateModel.value = STATES[state];
  countryModel.value = country;
}
</script>

<style scoped>
.field {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}
</style>
