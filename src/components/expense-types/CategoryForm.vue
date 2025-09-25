<template>
  <v-card>
    <v-card-title class="d-flex align-center header-slim">
      <h3>Create New Category</h3>
    </v-card-title>
    <v-card-text>
      <v-form ref="categoryForm" v-model="valid" @submit.prevent="submit()">
        <details-form v-model="category"></details-form>
        <v-row>
          <v-col cols="12">
            <strong>Flags</strong>
          </v-col>
          <slot></slot>
          <v-col cols="auto">
            <checkbox label="Show On Feed" v-model="category.showOnFeed" :disabled="expenseType.showOnFeed"></checkbox>
          </v-col>
          <v-col cols="auto">
            <checkbox label="URL Required" v-model="category.requireURL" :disabled="expenseType.requireURL"></checkbox>
          </v-col>
          <v-col cols="auto">
            <checkbox
              label="Receipt Required"
              v-model="category.requireReceipt"
              :disabled="expenseType.requireReceipt"
            ></checkbox>
          </v-col>
        </v-row>
        <div>
          <strong>Emails</strong>
          <case-email-field
            v-model="category.to"
            :disabled="!isEmpty(expenseType.to)"
            :required="false"
            label="To Email"
          ></case-email-field>
          <case-email-field
            v-model="category.cc"
            :disabled="!isEmpty(expenseType.cc)"
            :required="false"
            label="CC Email"
          ></case-email-field>
          <case-email-field
            v-model="category.bcc"
            :disabled="!isEmpty(expenseType.bcc)"
            :required="false"
            label="BCC Email"
          ></case-email-field>
          <case-email-field
            v-model="category.replyTo"
            :disabled="!isEmpty(expenseType.replyTo)"
            :required="false"
            label="Reply-To Email"
          ></case-email-field>
        </div>
        <v-card-actions>
          <submit-button :valid="valid"></submit-button>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>
<script setup>
import CaseEmailField from '@/components/shared/edit-fields/CaseEmailField.vue';
import Checkbox from '@/components/shared/edit-fields/Checkbox.vue';
import DetailsForm from '@/components/expense-types/forms/Details.vue';
import SubmitButton from '@/components/shared/buttons/SubmitButton.vue';
import { inject, ref } from 'vue';
import { isEmpty } from '@/utils/utils';

const emitter = inject('emitter');

const props = defineProps({
  model: Object,
  expenseType: Object,
  index: {
    type: Number,
    default: -1
  }
});

const category = ref(props.model);
const categoryForm = ref(null); // filled in from the template
const valid = ref(false); // form is valid

async function submit() {
  if (valid.value) {
    if (props.index == -1) {
      await addCategory();
    } else {
      await editCategory();
    }
    emitter.emit('save-category');
  }
}

async function editCategory() {
  props.expenseType.categories[props.index] = category.value;
  await props.expenseType.updateCategories(props.expenseType.categories);
}

async function addCategory() {
  await props.expenseType.updateCategories([...props.expenseType.categories, category.value]);
}
</script>
