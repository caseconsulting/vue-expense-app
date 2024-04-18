<template>
  <div class="d-flex align-center">
    <v-form v-if="isAdding" v-model="valid" class="d-flex d-inline-block align-center">
      <!-- Name of Technology -->
      <v-autocomplete
        v-model="model.name"
        @update:search="updateTechDropDown($event)"
        :rules="[
          ...duplicateTechnologyRules().map((func) => func(model.name, props.item, technologies)),
          ...getRequiredRules()
        ]"
        :items="techDropdown"
        autofocus
        hide-no-data
        class="d-inline-block field mr-4"
        label="Technology or Skill*"
        variant="underlined"
      >
      </v-autocomplete>

      <v-tooltip text="Enabling this will auto-increment the years of experience every month" location="top">
        <template v-slot:activator="{ props }">
          <v-switch
            v-model="model.current"
            v-bind="props"
            hide-details
            :color="caseGray"
            label="Current"
            density="compact"
            class="d-inline-block field mr-4"
          >
          </v-switch>
        </template>
      </v-tooltip>
    </v-form>
    <v-btn @click="addTech" :disabled="!valid" :color="isAdding ? (valid ? 'green' : '') : 'blue'" class="ma-2 ml-0">
      <span>{{ isAdding ? 'Insert' : 'Add' }}</span>
      <v-icon v-if="(isAdding && valid) || !isAdding">{{ isAdding ? (valid ? 'mdi-check' : '') : 'mdi-plus' }}</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { duplicateTechnologyRules, getRequiredRules } from '@/shared/validationUtils.js';
import _ from 'lodash';
import api from '@/shared/api.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');
const store = useStore();
const model = ref({
  name: '',
  current: true,
  years: 0
});
const isAdding = ref(false);
const valid = ref(true);
const technologies = ref(_.cloneDeep(props.item[props.field.key]));
const techDropdown = ref([]);
populateDropDown();

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [model.value],
  () => {
    emitter.emit('update-item', {
      field: props.field,
      item: { ...props.item, [`${props.field.key}`]: technologies }
    });
  },
  { deep: true }
);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

function addTech() {
  if (isAdding.value) {
    technologies.value.push(model.value);
    model.value = {
      name: '',
      current: true,
      years: 0
    };
    isAdding.value = false;
    valid.value = true;
  } else {
    isAdding.value = true;
  }
}

/**
 * Gets information that other employees have filled out.
 */
function populateDropDown() {
  let technologies = _.map(store.getters.employees, (employee) => employee.technologies)?.flat(); //extract technology
  technologies = _.compact(technologies); //remove falsey values
  // loop employees
  _.forEach(technologies, (t) => {
    techDropdown.value.push(t.name); // add technology name
  });
  techDropdown.value = _.uniq(techDropdown.value);
  techDropdown.value.sort((a, b) => a.length - b.length);
} // populateDropDowns

/**
 * Retrieves list of skills to display a dropdown
 * related to what the user just typed in.
 */
async function updateTechDropDown(query) {
  if (query?.length > 0) {
    let techList = await api.getTechSkills(query);
    techDropdown.value = techList;
    populateDropDown();
  } else if (techDropdown.value.length >= 0) {
    techDropdown.value = [];
    populateDropDown();
  }
} //updateTechDropDown
</script>

<style scoped>
.field {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}
</style>
