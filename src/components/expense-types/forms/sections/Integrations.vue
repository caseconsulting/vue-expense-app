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
    <div v-tooltip:top="tooltipText('unanetETs')">
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
    <div v-tooltip:top="tooltipText('unanetProjects')">
      <v-autocomplete
        variant="underlined"
        :items="unanetProjects"
        v-model="modelValue.unanetProject"
        item-title="name"
        item-value="key"
        label="Unanet Project (optional)"
        :disabled="unanetProjects.length == 0"
        @update:model-value="modelValue.unanetTask = undefined"
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
    <div v-tooltip:top="tooltipText('unanetTasks')">
      <v-autocomplete
        variant="underlined"
        :items="unanetTasks[modelValue.unanetProject]"
        v-model="modelValue.unanetTask"
        item-title="name"
        item-value="key"
        label="Unanet Task (optional)"
        no-data-text="No Tasks are associated with this Unanet Project"
        :disabled="Object.keys(unanetTasks).length == 0"
        clearable
      />
    </div>
  </div>
</template>
<script setup>
import { updateStoreCampfires } from '@/utils/storeUtils';
import { onBeforeMount, ref, computed } from 'vue';
import { useStore } from 'vuex';
import api from '@/shared/api.js';

const props = defineProps({
  modelValue: Object
});
const store = useStore();

const campfires = ref([]); // Basecamp campfires
const unanetETs = ref([]); // Unanet expense types
const unanetProjects = ref([]); // Unanet projects
const unanetTasks = ref({}); // Unanet tasks (tied to projects)

let gettingAPIData = ref(false);
function tooltipText(type) {
  if (gettingAPIData.value) return 'Waiting for Unanet data...';
  if (type == 'unanetETs' && unanetETs.value.length == 0) return 'No Unanet expense types found';
  if (type == 'unanetProjects' && unanetProjects.value.length == 0) return 'No Unanet projects found';
  if (type == 'unanetTasks' && Object.keys(unanetTasks.value).length == 0) return 'No Unanet tasks found';
  return null;
}

/**
 * Gets and sets all employees.
 */
onBeforeMount(async () => {
  // sets tooltip text
  gettingAPIData.value = true;

  // fetch data
  let [apiExpenseTypes, apiProjects] = await Promise.all([api.getUnanetExpenseTypes(), api.getUnanetProjects(), updateStoreCampfires()]);

  console.log(apiExpenseTypes, apiProjects);

  // load data into variables
  unanetETs.value = apiExpenseTypes;
  unanetProjects.value = apiProjects;
  campfires.value = store.getters.basecampCampfires;

  // index tasks by project id
  for (let { key, tasks } of unanetProjects.value) unanetTasks.value[key] = tasks;
  gettingAPIData.value = false;
});
</script>
