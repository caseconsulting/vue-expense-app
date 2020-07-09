<template>
  <v-card hover>
    <v-card-title class="header_style">
      <h3>Employee Details</h3>
    </v-card-title>
    <v-container>
      <v-form ref="form" v-model="valid" lazy-validation>
        <!-- LinkedIn account -->

        <!-- Degrees -->
        <p>Degrees:</p>
        <v-autocomplete v-model="this.employee.degree" :items="this.employee.degrees"></v-autocomplete>
        <p>in</p>
        <v-autocomplete v-model="this.employee.major" :items="this.employee.majors"></v-autocomplete>
        <!-- Plus button  -->
        <!-- <v-btn> -->
        <v-icon>add</v-icon>
        <!-- </v-btn> -->

        <!-- Experience -->
        <p>Experience:</p>

        <p>Case:</p>
        <!-- Start date -->
        <v-menu
          ref="hireMenu"
          :close-on-content-click="true"
          v-model="hireMenu"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
          style="padding-right: 20px; padding-bottom: 20px;"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="hireDateFormatted"
              :rules="dateRules"
              :disabled="hasExpenses"
              label="Start Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="date = parseDate(hireDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" no-title @input="hireMenu = false"></v-date-picker>
        </v-menu>
        <!-- End date -->
        <v-menu
          ref="hireMenu"
          :close-on-content-click="true"
          v-model="hireMenu"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
          style="padding-right: 20px; padding-bottom: 20px;"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="hireDateFormatted"
              :rules="dateRules"
              :disabled="hasExpenses"
              label="End Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="date = parseDate(hireDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" no-title @input="hireMenu = false"></v-date-picker>
        </v-menu>
        <!-- Plus button  -->
        <!-- If user adds another -->
        <!-- general, IC radio button -->
        <!-- title  -->
        <!-- start date -->
        <!-- end date -->

        <!-- Certifications -->
        <p>Certifications:</p>
        <!-- Title -->
        <!-- Date -->
        <!-- Optional expiration date -->

        <!-- Awards -->
        <p>Awards:</p>
        <!-- Title  -->
        <!-- date -->

        <!-- Technologies -->
        <p>Technologies</p>
        <!-- Title  -->
        <!-- Start Date -->
        <!-- End DAte optional -->

        <!-- Customer Org Experience -->
        <!-- Title -->
        <v-autocomplete></v-autocomplete>
        <!-- DST, ADO, Talent, ..., Other -->
        <!-- start date -->
        <!-- end date optional  -->

        <!-- Form action buttons -->
        <v-btn class="ma-2" color="white" @click="clearForm"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>
        <v-btn outlined class="ma-2" color="success" @click="submit" :disabled="!valid || isStatusEmpty()">
          <icon class="mr-1" name="save"></icon>Submit
        </v-btn>
        <!-- End form action buttons -->
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import { v4 as uuid } from 'uuid';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  this.$refs.form.resetValidation();
} // clearForm

/**
 * Checks if the work status is empty.
 *
 * @return boolean - work status is empty
 */
function isStatusEmpty() {
  return this.status.length == 0;
} // isStatusEmpty

/**
 * Submits the employee form.
 */
async function submit() {
  if (this.$refs.form.validate()) {
    this.$emit('startAction');
    // form validated
    if (!this.isInactive()) {
      // set deptDate if employee is active
      this.$set(this.employee, 'deptDate', '');
    }

    // set employee hire date
    this.$set(this.employee, 'hireDate', this.date);

    // set employee work status
    this.$set(this.employee, 'workStatus', parseInt(this.status));

    if (this.employee.id) {
      // updating employee
      let updatedEmployee = await api.updateItem(api.EMPLOYEES, this.employee);
      if (updatedEmployee.id) {
        // successfully updated employee
        this.$emit('update');
        this.clearForm();
        this.$emit('endAction');
      } else {
        // failed to update employee
        this.$emit('error', updatedEmployee.response.data.message);
        this.$emit('endAction');
      }
    } else {
      // creating employee
      this.employee.id = uuid();
      let newEmployee = await api.createItem(api.EMPLOYEES, this.employee);
      if (newEmployee.id) {
        // successfully created employee
        this.$emit('add', newEmployee);
        this.clearForm();
        this.$emit('endAction');
      } else {
        // failed to create employee
        this.$emit('error', newEmployee.response.data.message);
        this.$set(this.employee, 'id', ''); // reset id
        this.$emit('endAction');
      }
    }
  }
} // submit

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set the list of countries.
 */
async function created() {}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      employeeInfo: {
        degrees: [],
        majors: []
      },
      requiredRules: [(v) => !!v || 'This field is required'], // rules for required fields
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snackbar action status
      valid: false // form validity
    };
  },
  methods: {
    clearForm,
    isStatusEmpty,
    submit
  },
  props: ['employee']
};
</script>
