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
    ></v-text-field>
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
  if (countryModel.value === 'United States') {
    return true;
  } else {
    stateModel.value = null;
    return false;
  }
}
</script>

<style scoped>
.field {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}
</style>
