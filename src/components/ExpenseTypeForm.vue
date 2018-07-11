<template>
<v-card hover>
  <v-card-title>
    <h3 v-if="model.id"> Edit Expense Type </h3>
    <h3 v-else> Create New Expense Type </h3>
  </v-card-title>
  <v-container fluid>
<v-form ref="form" v-model="valid" lazy-validation >
  <v-text-field v-model="model.budgetName" :rules="genericRules" label="Budget Name" data-vv-name="Budget Name" required></v-text-field>
  <v-text-field type='number' v-model="model.budget" :rules="budgetRules" label="Budget" data-vv-name="Budget" required></v-text-field>
  <v-text-field v-model="model.description" :rules="genericRules" label="Notes" data-vv-name="Description" multi-line required></v-text-field>
  <v-checkbox
      label="Overdraft Flag"
      v-model="model.odFlag"
    ></v-checkbox>

    <!-- Buttons -->
  <v-btn outline color="error" @click="deleteExpenseType">
    <icon class="mr-1" name="trash"></icon>Delete</v-btn>
  <v-btn color="white" @click="clearForm"><icon class="mr-1" name="ban"></icon>Cancel</v-btn>
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
    async submit(newExpenseType) {
      console.log(typeof this.model.budget);
      let budget = parseInt(this.model.budget);
      this.model.budget = budget;
      if (!this.model.odFlag) {
        this.model.odFlag = false;
      }
      if (this.$refs.form.validate()) {
        if (this.model.id) {
          let newExpenseType = await api.updateItem(
            api.EXPENSE_TYPES,
            this.model.id,
            this.model
          );
          console.log(newExpenseType);
          console.log(typeof this.model.budget); //test line. Delete after testing
          this.$emit('update', newExpenseType);
        } else {
          let newExpenseType = await api.createItem(
            api.EXPENSE_TYPES,
            this.model
          );
          this.model.id = newExpenseType.id;
          this.$emit('add', newExpenseType);
        }
      }
    },
    async deleteExpenseType() {
      if (confirm('Are you sure you want to delete this expense?')) {
        await api.deleteItem(api.EXPENSE_TYPES, this.model.id);
        this.$emit('delete');
        this.clearForm();
      }
    },
    clearForm() {
      this.$refs.form.reset();
      this.model.budget = 0;
      this.model.budgetName = '';
      this.model.description = '';
      this.model.id = '';
      this.model.odFlag = false;
    }
  }
};
</script>
<style>
</style>
