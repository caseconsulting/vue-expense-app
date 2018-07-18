<template>
<v-card hover>
  <v-card-title>
    <h3 v-if="model.id"> Edit Expense Type </h3>
    <h3 v-else> Create New Expense Type </h3>
  </v-card-title>
  <v-container fluid>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field v-model="model.budgetName" :rules="genericRules" label="Budget Name" data-vv-name="Budget Name"></v-text-field>
      <v-text-field prefix="$" v-model="model.budget" :rules="budgetRules" label="Budget" data-vv-name="Budget"></v-text-field>
      <v-text-field v-model="model.description" :rules="genericRules" label="Notes" data-vv-name="Description" multi-line></v-text-field>
      <v-checkbox label="Overdraft Flag (optional)" v-model="model.odFlag"></v-checkbox>

      <!-- Buttons -->
      <v-btn outline color="error" @click="deleting=true">
        <icon class="mr-1" name="trash"></icon>Delete</v-btn>
      <v-btn color="white" @click="clearForm">
        <icon class="mr-1" name="ban"></icon>Cancel</v-btn>
      <v-btn outline color="success" @click="submit" :disabled="!valid">
        <icon class="mr-1" name="save"></icon>Submit</v-btn>
    </v-form>
  </v-container>
  <delete-modal :activate="deleting" :type="'expense type'"></delete-modal>
</v-card>
</template>

<script>
import api from '@/shared/api.js';
import DeleteModal from './DeleteModal.vue';
export default {
  data() {
    return {
      deleting: false,
      genericRules: [v => !!v || 'This field is required'],
      budgetRules: [
        v => !!v || 'Budget amount is required',
        v => /^\d+$/.test(v) || 'Cost must be a number'
      ],
      valid: false
    };
  },
  props: ['model'],
  components: {
    DeleteModal
  },
  created() {
    EventBus.$on('canceledDelete', () => this.deleting = false);
    EventBus.$on('confirmDelete', this.deleteExpenseType);
  },
  methods: {
    async submit(newExpenseType) {
      this.model.budget = parseInt(this.model.budget);
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
      this.deleting = false;
      await api.deleteItem(api.EXPENSE_TYPES, this.model.id);
      this.$emit('delete');
      this.clearForm();

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
