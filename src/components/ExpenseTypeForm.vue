<template>
  <v-card hover>
    <!-- form header -->
    <v-card-title class="header_style">
      <h3 v-if="model.id">Edit Expense Type</h3>
      <h3 v-else>Create New Expense Type</h3>
    </v-card-title>
    <v-container fluid>
      <!-- budget name field -->
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          v-model="model.budgetName"
          :rules="genericRules"
          label="Budget Name"
          data-vv-name="Budget Name"
          class="type_form_padding"
        ></v-text-field>

        <!-- categories field -->

        <v-combobox
          v-model="model.categories"
          hint="Maximum of 10 categories"
          label="Categories (optional)"
          multiple
          small-chips
          append-icon=""
          clearable
          :search-input.sync="categoryInput"
        >
          <template v-slot:selection="{ attrs, item }">
            <v-chip close outlined label color="gray" @click:close="removeCategory(item)">
              <strong>{{ item }}</strong
              >&nbsp;
            </v-chip>
          </template>
        </v-combobox>

        <br />

        <!-- budget field -->
        <v-text-field
          prefix="$"
          v-model="model.budget"
          :rules="budgetRules"
          label="Budget"
          data-vv-name="Budget"
        ></v-text-field>

        <!-- flags -->
        <v-container grid-list-md text-xs-center>
          <v-layout row wrap>
            <v-flex xs6>
              <v-checkbox label="Overdraft Flag" v-model="model.odFlag"></v-checkbox>
              <v-checkbox label="Recurring Flag" v-model="model.recurringFlag"></v-checkbox>
            </v-flex>
            <v-flex xs6>
              <v-checkbox label="Receipt Required" v-model="model.requiredFlag"></v-checkbox>
              <v-checkbox label="Mark as Inactive" v-model="model.isInactive"></v-checkbox>
            </v-flex>
          </v-layout>
        </v-container>
        <!-- startDate picker -->
        <v-menu
          v-if="!model.recurringFlag"
          :rules="genericRules"
          :close-on-content-click="true"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="startDateFormatted"
              :rules="dateRules"
              label="Start Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="model.startDate = parseDate(startDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="model.startDate" no-title></v-date-picker>
        </v-menu>
        <!-- end startDate picker -->
        <!-- endDate picker -->
        <v-menu
          v-if="!model.recurringFlag"
          :rules="genericRules"
          :close-on-content-click="true"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="endDateFormatted"
              :rules="dateRules"
              label="End Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="model.endDate = parseDate(endDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="model.endDate" no-title></v-date-picker>
        </v-menu>
        <!-- end endDate picker -->
        <!-- description field -->
        <v-textarea
          v-model="model.description"
          :rules="genericRules"
          label="Description "
          data-vv-name="Description "
        ></v-textarea>
        <!-- Buttons -->
        <v-btn color="white " @click="clearForm" class="ma-2"> <icon class="mr-1 " name="ban"></icon>Cancel</v-btn>
        <v-btn outlined class="ma-2" color="success" @click="submit" :disabled="!valid">
          <icon class="mr-1 " name="save"></icon>
          Submit
        </v-btn>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
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
  this.$set(this.model, 'requiredFlag', false);
  this.$set(this.model, 'isInactive', false);
  this.$set(this.model, 'categories', []);
}

function formatDate(date) {
  return dateUtils.formatDate(date);
}

function isEmpty(item) {
  return !item || item.trim().length <= 0;
}

function parseDate(date) {
  return dateUtils.parseDate(date);
}

async function submit() {
  // Add a typed-pending category if exists and not already included
  if (!this.isEmpty(this.categoryInput) && !this.model.categories.includes(this.categoryInput)) {
    this.model.categories.push(this.categoryInput);
  }

  this.model.budget = parseFloat(this.model.budget);
  if (!this.model.odFlag) {
    this.model.odFlag = false;
  }
  if (!this.model.recurringFlag) {
    this.model.recurringFlag = false;
  }
  if (!this.model.requiredFlag) {
    this.model.requiredFlag = false;
  }
  if (!this.model.isInactive) {
    this.model.isInactive = false;
  }

  if (this.$refs.form.validate()) {
    if (this.model.recurringFlag) {
      this.$set(this.model, 'startDate', null);
      this.$set(this.model, 'endDate', null);
    }

    if (this.model.id) {
      let newExpenseType = await api.updateItem(api.EXPENSE_TYPES, this.model.id, this.model);
      if (newExpenseType.id) {
        this.$emit('update');
      } else {
        this.$emit('error', newExpenseType.response.data.message);
      }
      this.clearForm();
    } else {
      let newExpenseType = await api.createItem(api.EXPENSE_TYPES, this.model);
      if (newExpenseType.id) {
        this.$set(this.model, 'id', newExpenseType.id);
        this.$emit('add', newExpenseType);
        this.clearForm();
      } else {
        this.$emit('error', newExpenseType.response.data.message);
      }
    }
  }
}

function removeCategory(category) {
  this.model.categories.splice(this.model.categories.indexOf(category), 1);
  this.model.categories = [...this.model.categories];
}

export default {
  data() {
    return {
      deleting: false,
      categoryInput: null, // category combobox input
      genericRules: [v => !!v || 'This field is required'],
      budgetRules: [
        v => !!v || 'Budget amount is required',
        v => parseFloat(v, 10) > 0 || 'Budget must be greater than 0.',
        v =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Budget amount must be a number with two decimal digits.'
      ],
      dateRules: [
        v => !!v || 'Date must be valid. Format: MM/DD/YYYY',
        v => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ],
      valid: false,
      startDateFormatted: null,
      endDateFormatted: null
    };
  },
  props: ['model'],
  methods: {
    clearForm,
    // deleteExpenseType,
    formatDate,
    isEmpty,
    parseDate,
    removeCategory,
    submit
  },
  watch: {
    'model.startDate': function() {
      this.startDateFormatted = this.formatDate(this.model.startDate) || this.startDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.startDate !== null && !this.formatDate(this.model.startDate)) {
        this.model.startDate = null;
      }
    },
    'model.endDate': function() {
      this.endDateFormatted = this.formatDate(this.model.endDate) || this.endDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.endDate !== null && !this.formatDate(this.model.endDate)) {
        this.model.endDate = null;
      }
    },
    'model.categories': function(val) {
      if (val.length > 10) {
        this.$nextTick(() => this.model.categories.pop());
      }
    }
  }
};
</script>
<style></style>
