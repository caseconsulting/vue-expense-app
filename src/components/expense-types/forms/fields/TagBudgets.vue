<template>
  <div>
    <div class="form-text">
      Tag Budgets (optional)
    </div>
    <v-container>
      <v-row v-for="(tag, index) in modelValue.tagBudgets" :key="index">
        <v-col class="d-flex flex-row justify-center align-center" cols="2">
          <div>
            <v-tooltip activator="parent" location="top">Move Tag Budget Priority Down One</v-tooltip>
            <v-btn
              :disabled="isLast(index, modelValue.tagBudgets)"
              @click="moveTagBudgetDown(index)"
              size="x-small"
              class="mr-1"
            >
              <v-icon icon="mdi-arrow-down-thin" />
            </v-btn>
          </div>
          <div>
            <v-tooltip activator="parent" location="top">Move Tag Budget Priority Up One</v-tooltip>
            <v-btn :disabled="isFirst(index)" size="x-small" @click="moveTagBudgetUp(index)">
              <v-icon icon="mdi-arrow-up-thin" />
            </v-btn>
          </div>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            variant="underlined"
            v-model="tag.tags"
            item-title="tagName"
            :rules="getRequiredRules()"
            item-value="id"
            multiple
            :items="tagOptions(tag.tags)"
          >
            <template v-slot:selection="{ item }">
              <v-chip size="small" closable @click.stop @click:close="remove(item.raw, index)">
                <v-icon icon="mdi-tag" class="mr-1" />
                {{ item.raw.tagName }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="3">
          <v-text-field variant="underlined" v-model="tag.budget" prefix="$" :rules="tagBudgetRules" label="Amount"
        /></v-col>
        <v-col cols="1" class="d-flex justify-center align-center">
          <v-btn size="small" @click="removeTagBudget(index)"><v-icon icon="mdi-trash-can" /></v-btn>
        </v-col>
      </v-row>
      <v-row class="d-flex justify-center align-center">
        <v-btn elevation="2" @click="addTagBudget()"><v-icon icon="mdi-plus" />Tag Budget</v-btn></v-row
      >
    </v-container>
  </div>
</template>
<script setup>
import { getRequiredRules } from '@/shared/validationUtils';
import { onBeforeMount, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { updateStoreTags } from '@/utils/storeUtils';

const props = defineProps({
  modelValue: Object
});
const store = useStore();

const tagBudgetRules = ref([
  (v) => !!v || 'Budget amount is required',
  (v) => parseFloat(v, 10) >= 0 || 'Budget must either be a positive or zero dollar amount.',
  (v) =>
    /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
    'Budget amount must be a number with two decimal digits.'
]); // rules for a tag budget
const tags = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and sets all employees.
 */
onBeforeMount(async () => {
  await updateStoreTags();
  tags.value = store.getters.tags;
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Creates empty tag budget field in tagBudgets list
 */
function addTagBudget() {
  props.modelValue.tagBudgets.push({});
}

/**
 * Checks if index in element is first in array
 *
 * @param index index of element
 */
function isFirst(index) {
  return index == 0;
}

/**
 * Checks if index of elment is last in array
 * @param index index of element
 * @param arr array
 */
function isLast(index, arr) {
  return index == arr.length - 1;
}

/**
 * Moves tag budget up one in priority
 * @param index index of tag budget to move
 */
function moveTagBudgetUp(index) {
  let temp = props.modelValue.tagBudgets[index - 1];
  props.modelValue.tagBudgets[index - 1] = props.modelValue.tagBudgets[index];
  props.modelValue.tagBudgets[index] = temp;
} // moveTagBudgetUp

/**
 * Moves tag budget down one in priority
 * @param index index of tag budget to move
 */
function moveTagBudgetDown(index) {
  let temp = props.modelValue.tagBudgets[index + 1];
  props.modelValue.tagBudgets[index + 1] = props.modelValue.tagBudgets[index];
  props.modelValue.tagBudgets[index] = temp;
} // moveTagBudgetDown

/**
 * Removes specified tag budget from list of tag budgets
 *
 * @param index index of tag budget to remove
 */
function removeTagBudget(index) {
  props.modelValue.tagBudgets.splice(index, 1);
}

/**
 * Removes given chip from tag autocomplete input.
 *
 * @param data chip data to remove
 * @param index autocomplete input index
 */
function remove(data, index) {
  let indx = props.modelValue.tagBudgets[index].tags.findIndex((t) => t == data.id);
  props.modelValue.tagBudgets[index].tags.splice(indx, 1);
}

/**
 * Gets tag options for the v-autocomplete dropdown completes. Makes sure that tag name cannot be used more than once.
 * @param selectedItems tag IDs already selected
 */
function tagOptions(selectedItems) {
  let selectedTags = [];
  if (props.modelValue.tagBudgets.length > 0) {
    props.modelValue.tagBudgets.forEach((t) => {
      if (t.tags) {
        t.tags.forEach((id) => {
          selectedTags.push(id);
        });
      }
    });
  }
  if (selectedItems && selectedItems.length > 0) {
    selectedTags = selectedTags.filter((st) => !selectedItems.includes(st));
  }
  return tags.value.filter((t) => !selectedTags.includes(t.id));
}
</script>