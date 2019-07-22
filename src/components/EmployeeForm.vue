<template>
  <v-card hover>
    <v-container fluid>
      <v-card-title>
        <h3 v-if="model.id">Edit Employee</h3>
        <h3 v-else>Create New Employee</h3>
      </v-card-title>

      <v-form ref="form" v-model="valid" lazy-validation>
        <!-- Name -->
        <v-text-field
          v-model="model.firstName"
          :rules="genericRules"
          label="First Name"
          data-vv-name="First Name"
        ></v-text-field>
        <v-text-field
          v-model="model.middleName"
          label="Middle Name (optional)"
          data-vv-name="Middle Name"
        ></v-text-field>
        <v-text-field
          v-model="model.lastName"
          :rules="genericRules"
          label="Last Name"
          data-vv-name="Last Name"
        ></v-text-field>

        <!-- Employee # -->
        <v-text-field
          v-model="model.employeeNumber"
          :rules="numberRules"
          label="Employee #"
          data-vv-name="Employee #"
        ></v-text-field>
        <!-- Email -->
        <v-text-field v-model="model.email" :rules="emailRules" label="Email" data-vv-name="Email"></v-text-field>

        <!-- Employee Role -->
        <v-autocomplete
          :disabled="!userIsAdmin()"
          :items="permissions"
          :rules="componentRules"
          v-model="employeeRoleFormatted"
          label="Employee Role"
          @blur="model.employeeRole = formatRole(employeeRoleFormatted)"
        ></v-autocomplete>

        <!-- Hire Date -->
        <v-menu
          ref="menu1"
          :close-on-content-click="true"
          v-model="menu1"
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
            v-model="hireDateFormatted"
            :rules="dateRules"
            label="Hire Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            @blur="model.hireDate = parseDate(hireDateFormatted)"
          ></v-text-field>
          <v-date-picker v-model="model.hireDate" no-title @input="menu1 = false"></v-date-picker>
        </v-menu>

        <!-- isactive? only on edit -->
        <v-checkbox v-if="model.id" label="Mark as Inactive" v-model="model.isActive"></v-checkbox>
        <!-- Buttons -->

        <v-tooltip bottom>
          <v-btn
            :disabled="this.model.id && this.model.personalExpenses.length > 0"
            outline
            color="error"
            @click="deleting = true"
            slot="activator"
          >
            <icon class="mr-1" name="trash"></icon>Delete</v-btn
          >
          <span v-if="this.model.id && this.model.personalExpenses.length > 0"
            >Employees can only be deleted if they have no expenses</span
          >
          <span v-else-if="this.model.id">Delete Available for Employee</span>
          <span v-else>Please select an employee prior to deletion</span>
        </v-tooltip>

        <v-btn color="white" @click="clearForm"> <icon class="mr-1" name="ban"></icon>Cancel</v-btn>
        <v-btn outline color="success" @click="submit" :disabled="!valid">
          <icon class="mr-1" name="save"></icon>Submit</v-btn
        >
      </v-form>
      <delete-modal :activate="deleting" :type="'employee'"></delete-modal>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import DeleteModal from './DeleteModal.vue';
import _ from 'lodash';
import { getRole } from '@/utils/auth';
import dateUtils from '@/shared/dateUtils';

const regex = /^(([^<>()[\]\\.,;:\s@#"]+(\.[^<>()[\]\\.,;:\s@#"]+)*)|(".+"))@consultwithcase.com/;

function clearForm() {
  this.$refs.form.reset();
  this.employeeRoleFormatted = 'User';
  this.$set(this.model, 'email', '@consultwithcase.com');
  this.$set(this.model, 'employeeRole', '');
  this.$set(this.model, 'firstName', '');
  this.$set(this.model, 'middleName', '');
  this.$set(this.model, 'lastName', '');
  this.$set(this.model, 'employeeNumber', '');
  this.$set(this.model, 'expenseTypes', []);
  this.$set(this.model, 'hireDate', '');
  this.$set(this.model, 'id', '');
}

async function deleteEmployee() {
  this.deleting = false;
  await api.deleteItem(api.EMPLOYEES, this.model.id);
  this.$emit('delete');
  this.clearForm();
}

function formatDate(date) {
  return dateUtils.formatDate(date);
}

function formatRole(employeeRole) {
  return _.kebabCase(employeeRole);
}

function parseDate(date) {
  return dateUtils.parseDate(date);
}

async function submit() {
  if (this.$refs.form.validate()) {
    if (this.model.id) {
      this.model.isActive = !this.model.isActive;
      let updatedEmployee = await api.updateItem(api.EMPLOYEES, this.model.id, this.model);
      this.$emit('update', updatedEmployee);
      this.clearForm();
    } else {
      let newEmployee = await api.createItem(api.EMPLOYEES, this.model);
      this.$set(this.model, 'id', newEmployee.id);
      this.$emit('add', newEmployee);
      this.clearForm();
    }
  }
}

function userIsAdmin() {
  return getRole() === 'super-admin';
}

export default {
  data() {
    return {
      componentRules: [v => !!v || 'Something must be selected'],
      permissions: ['Super Admin', 'Admin', 'User'],
      deleting: false,
      date: null,
      hireDateFormatted: null,
      employeeRoleFormatted: 'User',
      menu1: false,
      genericRules: [v => !!v || 'This field is required'],
      emailRules: [v => !!v || 'Email is required', v => regex.test(v) || 'Not a valid @consultwithcase email address'],
      numberRules: [v => !!v || 'Employee # is required', v => /^\d+$/.test(v) || 'Employee number must be a number'],
      dateRules: [
        v => !!v || 'Date must be valid. Format: MM/DD/YYYY',
        v => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ],
      valid: false
    };
  },
  created() {
    window.EventBus.$on('canceled-delete-employee', () => (this.deleting = false));
    window.EventBus.$on('confirm-delete-employee', this.deleteEmployee);
  },
  watch: {
    'model.hireDate': function() {
      this.hireDateFormatted = this.formatDate(this.model.hireDate) || this.hireDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.hireDate !== null && !this.formatDate(this.model.hireDate)) {
        this.model.hireDate = null;
      }
    },
    'model.employeeRole': function() {
      if (this.model.employeeRole) {
        this.employeeRoleFormatted = _.startCase(this.model.employeeRole);
      } else {
        this.employeeRoleFormatted = 'User';
      }
    }
  },
  props: ['model'],
  components: {
    DeleteModal
  },
  methods: {
    clearForm,
    deleteEmployee,
    formatDate,
    formatRole,
    parseDate,
    submit,
    userIsAdmin
    // tryDelete
  }
};
</script>

<style></style>
