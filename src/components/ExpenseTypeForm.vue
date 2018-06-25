<template>
<v-card hover :header="(model.id ? 'Edit Expense Type' : 'New Expense Type')">
  <v-card-title>
    <h3>Expense Type Form</h3>
  </v-card-title>
  <v-container fluid>
<v-form ref="form" v-model="valid" lazy-validation >
  <v-text-field v-model="model.budgetName" :rules="genericRules" label="Budget Name" data-vv-name="Budget Name" required></v-text-field>
  <v-text-field v-model="model.budget" :rules="budgetRules" label="Budget" data-vv-name="Budget" required></v-text-field>
  <v-text-field v-model="model.description" :rules="genericRules" label="Notes" data-vv-name="Description" multi-line required></v-text-field>
  <v-checkbox
      label="Overdraft Flag"
      v-model="model.odFlag"
    ></v-checkbox>
  <v-btn outline color="error" @click="$emit('delete-form')">
    <icon class="mr-1" name="trash"></icon>Delete</v-btn>
  <v-btn color="white" @click="clear"><icon class="mr-1" name="ban"></icon>Cancel</v-btn>
  <v-btn outline color="success" @click="submit" :disabled="!valid"><icon class="mr-1" name="save"></icon>Submit</v-btn>
  </v-form>
  </v-container>
</v-card>
</template>

<script>
import api from '@/shared/api.js';
export default {
  data() {
    return {
      genericRules: [v => !!v || 'This field is required'],
      budgetRules: [
        v => !!v || 'Budget amount is required',
        v => /^\d+$/.test(v) || 'Cost must be a number'
      ],
      valid: false
    };
  },
  props: ['model'],
  methods: {
    async submit() {
      if (!this.model.odFlag) {
        this.model.odFlag = false;
      }
      if (this.$refs.form.validate()) {
        if (this.model.id) {
          await api.updateItem(api.EXPENSE_TYPES, this.model.id, this.model);
        } else {
          await api.createItem(api.EXPENSE_TYPES, this.model);
        }
        this.clear();
        this.$emit('submit-form');
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  }
};
</script>
<style>
</style>
