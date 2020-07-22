<template>
  <v-card hover>
    <v-card-title class="header_style">
      <v-row class="px-5">
        <h4>Employee Details</h4>
        <v-spacer></v-spacer>
        <v-icon class="pb-2" justify="right" style="color: white;" @click="editing = true">edit</v-icon>
      </v-row>
    </v-card-title>
    <v-container>
      <v-form class="px-2" ref="form" v-model="valid" lazy-validation>
        <!-- LinkedIn account -->
        <!-- Tabs -->
        <v-tabs show-arrows class="pb-4">
          <v-tab href="#degrees">Degrees</v-tab>
          <v-tab href="#jobExperience">Job Experience</v-tab>
          <v-tab href="#certifications">Certifications</v-tab>
          <v-tab href="#awards">Awards</v-tab>
          <v-tab href="#technologies">Technologies</v-tab>
          <v-tab href="#customerOrgExp">Customer Org</v-tab>
          <!-- Degrees -->
          <v-tab-item id="degrees">
            <p class="pr-5" style="display: inline-block;">Degree:</p>
            <v-autocomplete
              style="width: 70%; display: inline-block;"
              v-model="this.employee.degree"
              :items="this.employee.degrees"
            ></v-autocomplete>
            <br />
            <p class="pr-5" style="display: inline-block;">Major:</p>
            <v-autocomplete
              style="width: 70%; display: inline-block;"
              v-model="this.employee.major"
              :items="this.employee.majors"
            ></v-autocomplete>
            <!-- Plus button  -->
            <v-icon>add</v-icon><br />
            <p class="pr-5" style="display: inline-block;">Minor:</p>
            <v-autocomplete
              style="width: 70%; display: inline-block;"
              v-model="this.employee.minor"
              :items="this.employee.minors"
            ></v-autocomplete>
            <!-- Plus button  -->
            <v-icon>add</v-icon><br />
            <p class="pr-5" style="display: inline-block;">Concentration:</p>
            <v-autocomplete
              style="width: 70%; display: inline-block;"
              v-model="this.employee.major"
              :items="this.employee.majors"
            ></v-autocomplete>
            <!-- Plus button  -->
            <v-icon>add</v-icon><br />
            <!-- Completion year -->
          </v-tab-item>
          <!-- Experience -->
          <v-tab-item id="jobExperience">
            <div class="pb-7">
              <p>Case:</p>
              <!-- Start date -->
              <v-menu
                :close-on-content-click="true"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
                style="padding-right: 20px; padding-bottom: 20px;"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    label="Start Date"
                    hint="MM/DD/YYYY format"
                    persistent-hint
                    prepend-icon="event"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker no-title></v-date-picker>
              </v-menu>
            </div>
            <!-- Plus button  -->
            <!-- If user adds another -->
            <div class="py-2">
              <!-- company  -->
              <p class="pr-3" style="display: inline-block;">Company:</p>
              <v-autocomplete style="display: inline-block; width: 80%;"></v-autocomplete>
              <br />
              <!-- general, IC radio button -->
              <input type="radio" id="general" name="job-type" value="general" />
              <label for="general">General</label><br />
              <input type="radio" id="ic" name="job-type" value="ic" />
              <label for="ic">IC</label><br />
              <!-- start date -->
              <v-menu
                :close-on-content-click="true"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
                style="padding-right: 20px; padding-bottom: 20px;"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    label="Start Date"
                    hint="MM/DD/YYYY format"
                    persistent-hint
                    prepend-icon="event"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker no-title></v-date-picker>
              </v-menu>
              <!-- end date -->
              <v-menu
                :close-on-content-click="true"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
                style="padding-right: 20px; padding-bottom: 20px;"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    label="End Date"
                    hint="MM/DD/YYYY format"
                    persistent-hint
                    prepend-icon="event"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker no-title></v-date-picker>
              </v-menu>
            </div>
          </v-tab-item>
          <!-- Certifications -->
          <v-tab-item id="certifications">
            <!-- Title -->
            <!-- Date -->
            <!-- Optional expiration date -->
          </v-tab-item>
          <!-- Awards -->
          <v-tab-item id="awards">
            <!-- Title  -->
            <!-- date -->
          </v-tab-item>
          <!-- Technologies -->
          <v-tab-item id="technologies">
            <!-- Title  -->
            <!-- Start Date -->
            <!-- End DAte optional -->
          </v-tab-item>
          <!-- Customer Org Experience -->
          <v-tab-item id="customerOrgExp">
            <!-- Title -->
            <v-autocomplete></v-autocomplete>
            <!-- DST, ADO, Talent, ..., Other -->
            <!-- start date -->
            <!-- end date optional  -->
          </v-tab-item>
        </v-tabs>

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
  this.editing = false;
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
  this.editing = false;
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
      editing: false,
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
