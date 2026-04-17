<template>
  <div>
    <v-row>
      <v-col cols="12">
        <strong>Integrations</strong>
      </v-col>
    </v-row>
    <v-autocomplete
      variant="underlined"
      :items="campfires"
      v-model="modelValue.campfire"
      item-title="name"
      item-value="url"
      label="Basecamp Campfire (optional)"
      clearable
    />
    <div v-tooltip:top="unanetETs.length == 0 ? 'No Unanet expense types found' : null">
      <v-autocomplete
        variant="underlined"
        :items="unanetETs"
        v-model="modelValue.unanetExpenseType"
        item-title="name"
        item-value="key"
        label="Unanet Expense Type (optional)"
        :disabled="unanetETs.length == 0"
        clearable
      />
    </div>
    <div v-tooltip:top="unanetProjects.length == 0 ? 'No Unanet projects found' : null">
      <v-autocomplete
        variant="underlined"
        :items="unanetProjects"
        v-model="modelValue.unanetProject"
        item-title="name"
        item-value="key"
        label="Unanet Project (optional)"
        :disabled="unanetProjects.length == 0"
        clearable
      >
        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :subtitle="item.raw.orgCode"
          ></v-list-item>
        </template>
      </v-autocomplete>
    </div>
  </div>
</template>
<script setup>
import { updateStoreCampfires } from '@/utils/storeUtils';
import { onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import api from '@/shared/api.js';

const props = defineProps({
  modelValue: Object
});
const store = useStore();

const campfires = ref([]); // Basecamp campfires
const unanetProjects = ref([]); // Unanet projects
const unanetETs = ref([]); // Unanet expense types

/**
 * Gets and sets all employees.
 */
onBeforeMount(async () => {
  // fetch data
  let [apiExpenseTypes, apiProjects] = await Promise.all([api.getUnanetExpenseTypes(), api.getUnanetProjects(), updateStoreCampfires()]);

  console.log(apiExpenseTypes);

  // load data into variables
  unanetETs.value = apiExpenseTypes;
  unanetProjects.value = apiProjects;
  campfires.value = store.getters.basecampCampfires;
});
</script>
