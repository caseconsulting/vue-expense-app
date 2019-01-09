<template>
<v-card hover>
  <v-container fluid>
    <v-card-title>
      <h3 v-if="model.id"> Edit Expense Type </h3>
      <h3 v-else> Create New Expense Type </h3>
    </v-card-title>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field v-model="model.budgetName" :rules="genericRules" label="Budget Name" data-vv-name="Budget Name"></v-text-field>
      <v-text-field prefix="$" v-model="model.budget" :rules="budgetRules" label="Budget" data-vv-name="Budget"></v-text-field>

      <v-checkbox label='Overdraft Flag (optional)' v-model='model.odFlag'></v-checkbox>

      <v-checkbox label='Recurring (optional)' v-model='model.recurringFlag'></v-checkbox>

      <v-menu v-if="!model.recurringFlag" :rules="genericRules" :close-on-content-click="true" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
        <v-text-field slot="activator" v-model="startDateFormatted" :rules="dateRules" label="Start Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" @blur="model.startDate = parseDate(startDateFormatted)"></v-text-field>
        <v-date-picker v-model="model.startDate" no-title></v-date-picker>
      </v-menu>

      <v-menu v-if="!model.recurringFlag" :close-on-content-click="true" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
        <v-text-field slot="activator" v-model="endDateFormatted" :rules="dateRules" label="End Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" @blur="model.endDate = parseDate(endDateFormatted)"></v-text-field>
        <v-date-picker v-model="model.endDate" no-title></v-date-picker>
      </v-menu>

      <v-text-field v-model='model.description' :rules="genericRules " label="Notes " data-vv-name="Description " multi-line></v-text-field>

      <!-- Buttons -->
      <v-btn outline color="error " @click="deleting=true ">
        <icon class="mr-1 " name='trash'></icon>Delete</v-btn>
      <v-btn color="white " @click="clearForm ">
        <icon class="mr-1 " name='ban'></icon>Cancel</v-btn>
      <v-btn outline color="success " @click="submit " :disabled="!valid ">
        <icon class="mr-1 " name='save'></icon>Submit</v-btn>
    </v-form>
    <delete-modal :activate="deleting " :type=" 'expense-type' "></delete-modal>
  </v-container>
</v-card>
</template>

<script>
import api from '@/shared/api.js';
import DeleteModal from './DeleteModal.vue';
import moment from 'moment';
import dateUtils from '@/shared/dateUtils';

// METHODS
function clearForm() {
  this.$refs.form.reset();
  this.$set(this.model, 'id', '');
  this.$set(this.model, 'budget', 0);
  this.$set(this.model, 'budgetName', '');
  this.$set(this.model, 'description', '');
  this.$set(this.model, 'recurringFlag', false);
  this.$set(this.model, 'startDate', '');
  this.$set(this.model, 'endDate', '');
  this.$set(this.model, 'odFlag', false);
}

async function deleteExpenseType() {
  this.deleting = false;
  await api.deleteItem(api.EXPENSE_TYPES, this.model.id);
  this.$emit('delete');
  this.clearForm();
}

function formatDate(date) {
  return dateUtils.formatDate(date);
}

function parseDate(date) {
  return dateUtils.parseDate(date);
}

async function submit(newExpenseType) {
  this.model.budget = parseFloat(this.model.budget);
  if (!this.model.odFlag) {
    this.model.odFlag = false;
  }
  if (this.model.budget > 0 && moment(this.model.startDate).is) {

  }
  if (this.$refs.form.validate()) {
    if (this.model.recurringFlag) {
      this.$set(this.model, 'startDate', null);
      this.$set(this.model, 'endDate', null);
    }
    if (this.model.id) {
      let newExpenseType = await api.updateItem(api.EXPENSE_TYPES, this.model.id, this.model);

      this.$emit('update', newExpenseType);
    } else {
      let newExpenseType = await api.createItem(api.EXPENSE_TYPES, this.model);
      this.$set(this.model, 'id', newExpenseType.id);
      this.$emit('add', newExpenseType);
    }
    this.clearForm();
  }
}

export default {
  data() {
    return {
      deleting: false,
      genericRules: [v => !!v || 'This field is required'],
      budgetRules: [
        v => !!v || 'Budget amount is required',
        v => parseFloat(v, 10) > 0 || 'Budget must be greater than 0.',
        v =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Budget amount must be a number with two decimal digits.'
      ],
      dateRules: [v => !!v || 'Date must be valid. MM/DD/YYYY format'],
      valid: false,
      startDateFormatted: null,
      endDateFormatted: null
    };
  },
  props: ['model'],
  components: {
    DeleteModal
  },
  created() {
    EventBus.$on('canceled-delete-expense-type', () => (this.deleting = false));
    EventBus.$on('confirm-delete-expense-type', this.deleteExpenseType);
  },
  methods: {
    clearForm,
    deleteExpenseType,
    parseDate,
    formatDate,
    submit
  },
  watch: {
    'model.startDate': function(val) {
      this.startDateFormatted = this.formatDate(this.model.startDate);
    },
    'model.endDate': function(val) {
      this.endDateFormatted = this.formatDate(this.model.endDate);
    }
  }
};
</script>
<style>
</style>
