<template>
  <v-card>
    <v-card-title class="d-flex align-center header-slim">
      <h3>Create New Category</h3>
    </v-card-title>
    <v-card-text>
      <v-form ref="categoryForm" v-model="valid" @submit.prevent="valid ? (submitForm = true) : _" lazy-validation>
        <details-form v-model="category"></details-form>
        <flags v-model="category"></flags>
        <emails v-model="category"></emails>
        <v-card-actions>
          <submit-button :valid="valid"></submit-button>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>
<script setup>
import DetailsForm from '@/components/expense-types/forms/Details.vue';
import Emails from '@/components/expense-types/forms/Emails.vue';
import Flags from '@/components/expense-types/forms/Flags.vue';
import SubmitButton from '@/components/shared/buttons/SubmitButton.vue';
import { ref } from 'vue';
import { Category } from '@/models/category';

const model = defineModel('model', {
  type: Object,
  default: {}
});

const category = ref(new Category(model.value));
const categoryForm = ref(null); // filled in from the template
const valid = ref(false); // form is valid
</script>