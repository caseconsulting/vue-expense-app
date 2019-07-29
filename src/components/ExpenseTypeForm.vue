<template>
  <v-card hover>
    <v-container fluid>
      <!-- form header -->
      <v-card-title>
        <h3 v-if="model.id">Edit Expense Type</h3>
        <h3 v-else>Create New Expense Type</h3>
      </v-card-title>

      <!-- budget name field -->
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          v-model="model.budgetName"
          :rules="genericRules"
          label="Budget Name"
          data-vv-name="Budget Name"
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
        >
          <template slot="selection" slot-scope="data">
            <v-chip :selected="data.selected" close outline label color="gray" @input="removeCategory(data.item)">
              <strong>{{ data.item }}</strong
              >&nbsp;
            </v-chip>
          </template>
        </v-combobox>

        <!-- <v-select v-model="model.categories" label="Categories (optional)" chips tags append-icon="" flat clearable>
          <template slot="selection" slot-scope="data">
            <v-chip :selected="data.selected" close outline label color="gray" @input="removeCategory(data.item)">
              <strong>{{ data.item }}</strong
              >&nbsp;
            </v-chip>
          </template>
        </v-select> -->
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
        <v-checkbox label="Overdraft Flag (optional)" v-model="model.odFlag"></v-checkbox>

        <v-checkbox label="Recurring Flag (optional)" v-model="model.recurringFlag"></v-checkbox>

        <!-- Requires receipt attachment for expense type -->
        <v-checkbox label="Receipt Required (optional)" v-model="model.requiredFlag"></v-checkbox>

        <!-- Flag set if expense is inactive -->
        <v-checkbox label="Mark as Inactive (optional)" v-model="model.isInactive"></v-checkbox>

        <!-- start date picker -->
        <v-menu
          v-if="!model.recurringFlag"
          :rules="genericRules"
          :close-on-content-click="true"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="startDateFormatted"
            :rules="dateRules"
            label="Start Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            @blur="model.startDate = parseDate(startDateFormatted)"
          ></v-text-field>
          <v-date-picker v-model="model.startDate" no-title></v-date-picker>
        </v-menu>

        <!-- end date picker -->
        <v-menu
          v-if="!model.recurringFlag"
          :close-on-content-click="true"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="endDateFormatted"
            :rules="dateRules"
            label="End Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            @blur="model.endDate = parseDate(endDateFormatted)"
          ></v-text-field>
          <v-date-picker v-model="model.endDate" no-title></v-date-picker>
        </v-menu>

        <!-- description field -->
        <v-textarea
          v-model="model.description"
          :rules="genericRules"
          label="Description "
          data-vv-name="Description "
        ></v-textarea>

        <!-- Buttons -->

        <v-tooltip bottom>
          <v-btn
            :disabled="this.model.id && this.model.typeExpenses.length > 0"
            outline
            color="error"
            @click="deleting = true"
            slot="activator"
          >
            <icon class="mr-1" name="trash"></icon>Delete</v-btn
          >
          <span v-if="this.model.id && this.model.typeExpenses.length > 0"
            >Expense Types can only be deleted if they have no expenses associated.
          </span>

          <span v-else-if="this.model.id">Delete Available for Expense Type</span>
          <span v-else>Please select an Expense Type prior to deletion</span>
        </v-tooltip>

        <v-btn color="white " @click="clearForm"> <icon class="mr-1 " name="ban"></icon>Cancel</v-btn>
        <v-btn outline color="success " @click="submit" :disabled="!valid">
          <icon class="mr-1 " name="save"></icon>Submit</v-btn
        >
      </v-form>
      <delete-modal :activate="deleting" :type="'expense-type'"></delete-modal>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import DeleteModal from './DeleteModal.vue';
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

async function deleteExpenseType() {
  this.deleting = false;
  let et = await api.deleteItem(api.EXPENSE_TYPES, this.model.id);
  if (et.id) {
    this.$emit('delete');
    this.clearForm();
  } else {
    this.$emit('error', et.response.data.message);
  }
}

function formatDate(date) {
  return dateUtils.formatDate(date);
}

function parseDate(date) {
  return dateUtils.parseDate(date);
}

async function submit() {
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
        this.$emit('update', newExpenseType);
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
  components: {
    DeleteModal
  },
  created() {
    window.EventBus.$on('canceled-delete-expense-type', () => (this.deleting = false));
    window.EventBus.$on('confirm-delete-expense-type', this.deleteExpenseType);
  },
  methods: {
    clearForm,
    deleteExpenseType,
    parseDate,
    formatDate,
    submit,
    removeCategory
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
