<template>
  <div>
    <!-- Current Address: Street 1 -->
    <v-text-field
      v-model.trim="streetModel"
      autofocus
      label="Street 1"
      variant="underlined"
      hint="Search address and select option to auto-fill fields"
      class="d-inline-block field mr-4"
      @update:modelValue="searchAddress($event)"
    >
      <v-menu target="parent" v-model="showMenu" location="bottom">
        <v-list v-if="predictions.length > 0" :items="predictions" @click:select="predictionSelected"></v-list
      ></v-menu>
    </v-text-field>
    <!-- Current Address: Street 2 -->
    <v-text-field
      v-model.trim="street2Model"
      hide-details
      label="Street 2"
      variant="underlined"
      class="d-inline-block field mr-4"
    ></v-text-field>
    <!-- Current Address: City -->
    <v-text-field
      v-model.trim="cityModel"
      hide-details
      label="City"
      variant="underlined"
      class="d-inline-block field mr-4"
    ></v-text-field>
    <!-- Current Address: State -->
    <v-autocomplete
      v-model="stateModel"
      :items="Object.values(STATES)"
      hide-details
      label="State"
      variant="underlined"
      class="d-inline-block field mr-4"
    ></v-autocomplete>
    <!-- Current Address: ZIP -->
    <v-text-field
      v-model.trim="ZIPModel"
      hide-details
      v-mask="'#####'"
      label="ZIP"
      variant="underlined"
      class="d-inline-block small-field"
    ></v-text-field>
  </div>
</template>

<script setup>
import { STATES } from '@/utils/utils';
import { inject, ref, watch } from 'vue';
import { mask } from 'vue-the-mask';
import _ from 'lodash';
import api from '@/shared/api.js';
const vMask = (a, b) => mask(a, b);

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');
const streetModel = ref(props.item['currentStreet']);
const street2Model = ref(props.item['currentStreet2']);
const cityModel = ref(props.item['currentCity']);
const stateModel = ref(props.item['currentState']);
const ZIPModel = ref(props.item['currentZIP']);
const showMenu = ref(false);
const predictions = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [streetModel.value, street2Model.value, cityModel.value, stateModel.value, ZIPModel.value],
  () => {
    emitter.emit('update-item', {
      field: props.field,
      item: {
        ...props.item,
        currentStreet: streetModel.value,
        currentStreet2: street2Model.value,
        currentCity: cityModel.value,
        currentState: stateModel.value,
        currentZIP: ZIPModel.value
      }
    });
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

async function searchAddress(query) {
  predictions.value = [];
  if (query?.length > 3) {
    showMenu.value = true;
    let locations = await api.getLocation(query);
    _.forEach(locations.predictions, (location) => {
      predictions.value.push({ title: location.description, value: location.place_id });
    });
  } else {
    showMenu.value = false;
  }
}

async function predictionSelected(event) {
  let prediction = _.find(predictions.value, { value: event.id });
  let [street, city, state] = prediction.title.split(', ');
  streetModel.value = street;
  cityModel.value = city;
  stateModel.value = STATES[state];
  let zipResult = await api.getZipCode(prediction.value);
  ZIPModel.value = _.find(zipResult?.result?.address_components, (c) => c.types.includes('postal_code'))?.short_name;
}
</script>

<style scoped>
.field {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}
.small-field {
  width: 150px !important;
  min-width: 150px !important;
  max-width: 150px !important;
}
</style>
