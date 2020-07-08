<template>
  <v-card hover>
    <v-card-title class="header_style">
      <h3>Employee Details</h3>
    </v-card-title>
    <v-container>
      <v-form>
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
 * Submits the employee form.
 */
async function submit() {
  if (this.$refs.form.validate()) {
    this.$emit('startAction');
    // form validated
    if (!this.isInactive()) {
      // set deptDate if employee is active
      this.$set(this.model, 'deptDate', '');
    }

    // set employee hire date
    this.$set(this.model, 'hireDate', this.date);

    // set employee work status
    this.$set(this.model, 'workStatus', parseInt(this.status));

    if (this.model.id) {
      // updating employee
      let updatedEmployee = await api.updateItem(api.EMPLOYEES, this.model);
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
      this.model.id = uuid();
      let newEmployee = await api.createItem(api.EMPLOYEES, this.model);
      if (newEmployee.id) {
        // successfully created employee
        this.$emit('add', newEmployee);
        this.clearForm();
        this.$emit('endAction');
      } else {
        // failed to create employee
        this.$emit('error', newEmployee.response.data.message);
        this.$set(this.model, 'id', ''); // reset id
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
    return {};
  },
  methods: {
    clearForm,
    submit
  }
};
</script>

<style>
.customInput :hover {
  border: solid 1px black;
}

.disabled {
  background-color: #ddd;
}

.inputError {
  border: solid 1px red !important;
}

.percentageBox {
  border: solid 1px gray;
  width: 46px;
  height: 34px;
  border-radius: 2px;
  font-size: 14px;
  display: flex;
}

.percentageBox div {
  padding-top: 6px;
  margin-left: 2px;
}

.percentageBox div:hover {
  border: none;
}

.percentageBox input {
  text-align: right;
  width: 60%;
}

.percentageBox input:hover {
  border: none;
}
</style>
