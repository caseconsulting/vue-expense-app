<template>
  <v-card hover>
    <v-card-title class="header_style">
      <h3 v-if="model.id">Edit Employee</h3>
      <h3 v-else>Create New Employee</h3>
    </v-card-title>

    <v-container fluid>
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
          :full-width="true"
          style="padding-right: 20px; padding-bottom: 20px;"
          ref="menu1"
          :close-on-content-click="true"
          v-model="menu1"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
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

        <!-- Advanced section -->

        <v-expansion-panel>
          <v-expansion-panel-content style="background-color: whitesmoke;">
            <template v-slot:header>
              <div>
                ADVANCED (optional)
              </div>
            </template>

            <!-- Prime text field -->
            <v-text-field
              style="padding-right: 20px; padding-left: 10px;"
              v-model="model.prime"
              label="Prime"
              data-vv-name="Prime"
            ></v-text-field>

            <!-- Contract text field -->
            <v-text-field
              style="padding-right: 20px; padding-left: 10px;"
              v-model="model.contract"
              label="Contract"
              data-vv-name="Contract"
            ></v-text-field>

            <!-- Github text field -->
            <v-text-field
              style="padding-right: 20px; padding-left: 10px;"
              v-model="model.github"
              label="Github"
              data-vv-name="Github"
            ></v-text-field>

            <!-- Twitter text field -->
            <v-text-field
              style="padding-right: 20px; padding-left: 10px;"
              v-model="model.twitter"
              label="Twitter"
              data-vv-name="Twitter"
            ></v-text-field>

            <!-- Job Role autocomplete -->
            <v-autocomplete
              style="padding-right: 20px; padding-left: 10px;"
              :items="jobRoles"
              v-model="model.jobRole"
              item-text="text"
              label="Job Role"
            ></v-autocomplete>

            <!-- Birthday Picker -->
            <v-menu
              ref="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  style="padding-left: 10px; padding-right: 20px;"
                  v-model="birthdayFormat"
                  label="Birthday"
                  prepend-icon="event"
                  readonly
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="model.birthday"
                ref="picker"
                :max="new Date().toISOString().substr(0, 10)"
                min="1900-01-01"
              ></v-date-picker>
            </v-menu>

            <!-- Place of Birth -->
            <p style="font-size: 17px; padding-left: 10px; padding-top: 10px;">Place of Birth</p>
            <div style="padding-right: 20px; padding-left: 30px; padding-bottom: 10px;">
              <div style="border-left-style: groove; padding-right: 20px; padding-left: 10px; ">
                <!-- Place of Birth: City text field -->
                <v-text-field
                  v-model="model.city"
                  label="City"
                  data-vv-name="City"
                  style="padding-top: 0px;"
                ></v-text-field>

                <!-- Place of Birth: State autocomplete -->
                <v-autocomplete
                  :items="states"
                  v-model="model.st"
                  item-text="text"
                  label="State"
                  style="padding-top: 0px; padding-bottom: 0px;"
                ></v-autocomplete>

                <!-- Place of Birth: Country text field -->
                <v-text-field
                  v-model="model.country"
                  label="Country"
                  data-vv-name="Country"
                  style="padding-top: 0px;"
                ></v-text-field>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <!-- isactive? only on edit -->
        <v-checkbox label="Mark as Inactive" v-model="model.isInactive"></v-checkbox>

        <!-- if inactive, set Departure Date -->
        <v-menu
          :full-width="true"
          style="padding-right: 20px; padding-bottom: 20px;"
          ref="menu2"
          :close-on-content-click="true"
          v-model="menu2"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
          v-if="model.isInactive"
        >
          <v-text-field
            slot="activator"
            v-model="deptDateFormatted"
            :rules="dateRules"
            label="Departure Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            @blur="model.deptDate = parseDate(deptDateFormatted)"
          ></v-text-field>
          <v-date-picker v-model="model.deptDate" no-title @input="menu2 = false"></v-date-picker>
        </v-menu>

        <!-- Buttons -->
        <v-btn color="white" @click="clearForm"> <icon class="mr-1" name="ban"></icon>Cancel</v-btn>
        <v-btn outline color="success" @click="submit" :disabled="!valid">
          <icon class="mr-1" name="save"></icon>Submit</v-btn
        >
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { getRole } from '@/utils/auth';
import dateUtils from '@/shared/dateUtils';

const regex = /^(([^<>()[\]\\.,;:\s@#"]+(\.[^<>()[\]\\.,;:\s@#"]+)*)|(".+"))@consultwithcase.com/;

function clearForm() {
  this.$refs.form.reset();
  this.$set(this.model, 'email', '@consultwithcase.com');
  this.$set(this.model, 'employeeRole', '');
  this.$set(this.model, 'firstName', '');
  this.$set(this.model, 'middleName', '');
  this.$set(this.model, 'lastName', '');
  this.$set(this.model, 'employeeNumber', '');
  this.$set(this.model, 'hireDate', '');
  this.$set(this.model, 'id', '');

  // New Fields
  this.$set(this.model, 'prime', '');
  this.$set(this.model, 'contract', '');
  this.$set(this.model, 'github', '');
  this.$set(this.model, 'twitter', '');
  this.$set(this.model, 'jobRole', '');
  this.$set(this.model, 'birthday', '');
  this.$set(this.model, 'city', '');
  this.$set(this.model, 'st', '');
  this.$set(this.model, 'country', '');
  this.$set(this.model, 'deptDate', '');
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
    if (!this.model.isInactive) {
      this.$set(this.model, 'deptDate', '');
    }

    if (this.model.id) {
      let updatedEmployee = await api.updateItem(api.EMPLOYEES, this.model.id, this.model);
      if (updatedEmployee.id) {
        this.$emit('update');
        this.clearForm();
      } else {
        this.$emit('error', updatedEmployee.response.data.message);
      }
    } else {
      let newEmployee = await api.createItem(api.EMPLOYEES, this.model);
      if (newEmployee.id) {
        this.$set(this.model, 'id', newEmployee.id);
        this.$emit('add', newEmployee);
        this.clearForm();
      } else {
        this.$emit('error', newEmployee.response.data.message);
      }
    }
  }
}

function userIsAdmin() {
  return getRole() === 'admin';
}

export default {
  data() {
    return {
      birthdayFormat: '',
      jobRoles: [
        'Software Developer',
        'Project Manager',
        'System Engineer',
        'Cloud Architect',
        'Cloud Engineer',
        'Data Scientist',
        'QA/Tester',
        'Intern',
        'Accountant',
        'Other'
      ],
      states: [
        'Alabama',
        'Alaska',
        'American Samoa',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'District of Columbia',
        'Federated States of Micronesia',
        'Florida',
        'Georgia',
        'Guam',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Marshall Islands',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Minor Outlying Islands',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Northern Mariana Islands',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Puerto Rico',
        'Republic of Palau',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'U.S. Minor Outlying Islands',
        'U.S. Virgin Islands',
        'Utah',
        'Vermont',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming'
      ],
      componentRules: [v => !!v || 'Something must be selected'],
      permissions: ['Admin', 'User'],
      deleting: false,
      date: null,
      hireDateFormatted: null,
      deptDateFormatted: null,
      employeeRoleFormatted: '',
      menu1: false,
      menu2: false,
      genericRules: [v => !!v || 'This field is required'],
      emailRules: [v => !!v || 'Email is required', v => regex.test(v) || 'Not a valid @consultwithcase email address'],
      numberRules: [
        v => !!v || 'Employee # is required',
        v => /^\d+$/.test(v) || 'Employee # must be a positive number'
      ],
      dateRules: [
        v => !!v || 'Date must be valid. Format: MM/DD/YYYY',
        v => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ],
      valid: false
    };
  },
  watch: {
    'model.hireDate': function() {
      this.hireDateFormatted = this.formatDate(this.model.hireDate) || this.hireDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.hireDate !== null && !this.formatDate(this.model.hireDate)) {
        this.model.hireDate = null;
      }
    },
    'model.deptDate': function() {
      this.deptDateFormatted = this.formatDate(this.model.deptDate) || this.deptDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.deptDate !== null && !this.formatDate(this.model.deptDate)) {
        this.model.deptDate = null;
      }
    },
    'model.employeeRole': function() {
      if (this.model.employeeRole != 'User') {
        this.employeeRoleFormatted = _.startCase(this.model.employeeRole);
      }
    },
    'model.birthday': function() {
      this.birthdayFormat = this.formatDate(this.model.birthday) || this.birthdayFormat;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.birthday !== null && !this.formatDate(this.model.birthday)) {
        this.model.birthday = null;
      }
    }
  },
  props: ['model'],
  methods: {
    clearForm,
    formatDate,
    formatRole,
    parseDate,
    submit,
    userIsAdmin
  }
};
</script>
