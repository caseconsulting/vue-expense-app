<template>
  <div class="d-flex align-center">
    <v-form v-model="valid" ref="form" class="d-flex d-inline-block align-center">
      <!-- Name of Technology -->
      <v-autocomplete
        v-model="model.name"
        @update:search="updateTechDropDown($event)"
        :rules="[
          ...duplicateTechnologyRules().map((func) => func(model.name, props.item, technologies)),
          ...getRequiredRules()
        ]"
        :items="techDropdown"
        class="d-inline-block field"
        label="Technology or Skill*"
        variant="underlined"
      >
      </v-autocomplete>
      <!-- Years With Technology -->
      <v-text-field
        v-model.number="model.years"
        :rules="[...getRequiredRules(), ...technologyExperienceRules().map((func) => func(model.years, model))]"
        label="Years"
        variant="underlined"
        class="small-field mx-6"
      >
      </v-text-field>
      <!-- Current Switch -->
      <v-tooltip text="Enabling will auto-increment the years of experience every month" location="top">
        <template v-slot:activator="{ props }">
          <v-switch
            v-model="model.current"
            v-bind="props"
            hide-details
            :color="caseGray"
            label="Current"
            density="compact"
            class="d-inline-block field"
          >
          </v-switch>
        </template>
      </v-tooltip>
    </v-form>
    <!-- <div v-if="unsavedTechnologies">Unsaved Technologies: {{ unsavedTechnologies }}</div> -->
    <v-btn @click="addTech" size="small" :disabled="!valid" :color="valid ? 'green' : ''">
      <span>Add</span>
      <template v-slot:append>
        <v-icon>mdi-plus</v-icon>
      </template>
    </v-btn>
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { duplicateTechnologyRules, getRequiredRules, technologyExperienceRules } from '@/shared/validationUtils.js';
import _cloneDeep from 'lodash/cloneDeep';
import _map from 'lodash/map';
import _compact from 'lodash/compact';
import _forEach from 'lodash/forEach';
import _uniq from 'lodash/uniq';
import api from '@/shared/api.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');
const store = useStore();
const form = ref(null);
const model = ref({
  name: null,
  current: true,
  years: 0
});
const valid = ref(false);
const technologies = ref(_cloneDeep(props.item[props.field.key]));
const techDropdown = ref([]);
populateDropDown();

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

// const unsavedTechnologies = computed(() => {
//   let originalEmp = _find(store.getters.employees, (e) => e.id === props.item.id);
//   let addedTechs = _xorBy(originalEmp[props.field.key], technologies.value, 'name');
//   return _map(addedTechs, (t) => t.name)?.join(' & ');
// });

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [model.value],
  async () => {
    // validate model when values are not default
    if (model.value.name !== null || !model.value.current || !!model.value.years) await form.value.validate();
    emitter.emit('update-item', {
      field: props.field,
      item: { ...props.item, [`${props.field.key}`]: technologies.value }
    });
  },
  { deep: true }
);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

async function addTech() {
  await form.value.validate();
  if (valid.value) {
    technologies.value ? technologies.value.push(model.value) : (technologies.value = [model.value]);
    model.value = {
      name: null,
      current: true,
      years: 0
    };
    valid.value = false;
  }
}

/**
 * Gets information that other employees have filled out.
 */
function populateDropDown() {
  let technologies = _map(store.getters.employees, (employee) => employee.technologies)?.flat(); //extract technology
  technologies = _compact(technologies); //remove falsey values
  // loop employees
  _forEach(technologies, (t) => {
    techDropdown.value.push(t.name); // add technology name
  });
  techDropdown.value = _uniq(techDropdown.value);
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
  if (query.length === 0) {
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
.small-field {
  width: 150px !important;
  min-width: 150px !important;
  max-width: 150px !important;
}
</style>
