<template>
  <!-- the v-container adds nice padding -->
  <v-container>
    <v-form ref="form" v-model="valid" validate-on="input">
      <v-row v-for="(experience, index) in editedEmployee.customerOrgExp" :key="experience + index" no-gutters>
        <v-col>
          <v-row no-gutters>
            <v-col class="ma-3 d-flex-inline align-center">
              <!-- name -->
              <v-autocomplete
                v-model="experience.name"
                label="Name"
                :items="CUSTOMER_ORGS"
                :rules="[...getRequiredRules(), getDuplicateCustomerOrgRule(editedEmployee.customerOrgExp)]"
                hide-details="auto"
              ></v-autocomplete>
            </v-col>

            <!-- delete button -->
            <v-col cols="auto" class="d-flex align-center">
              <v-btn icon="mdi-delete" variant="text" @click="deleteExperience(index)"></v-btn>
            </v-col>
          </v-row>

          <v-row>
            <!-- years -->
            <v-col class="ma-3 d-flex align-center justify-center">
              <v-text-field
                v-model="experience.years"
                suffix="Years"
                type="number"
                min="0"
                max="99"
                hide-details="auto"
                style="min-width: 100px"
              ></v-text-field>
            </v-col>

            <!-- current -->
            <v-col cols="auto" class="mx-3 d-flex align-center justify-center">
              <v-switch
                v-model="experience.current"
                label="Currently working with this customer organization"
                color="primary"
              >
              </v-switch>
            </v-col>
          </v-row>
        </v-col>

        <v-divider
          v-if="index < editedEmployee.customerOrgExp.length - 1"
          class="border-opacity-25 mb-6 mt-4"
          thickness="3"
        ></v-divider>
      </v-row>

      <v-row>
        <v-col class="d-flex justify-center">
          <v-btn prepend-icon="mdi-plus" @click="addExperience()">Add Customer Org</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup>
import { CUSTOMER_ORGS } from '@/shared/employeeUtils';
import { getDuplicateCustomerOrgRule, getRequiredRules } from '@/shared/validationUtils';
import { inject, ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');

const editedEmployee = defineModel({ required: true });
const valid = defineModel('valid', { required: true });
const form = ref(null);

defineExpose({ prepareSubmit });

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

async function prepareSubmit() {
  if (form.value) {
    const result = await form.value.validate();
    emitter.emit('validating', { tab: 'clearance', valid: result.valid });
    return result;
  }
  return null;
}

function addExperience() {
  if (!editedEmployee.value.customerOrgExp) editedEmployee.value.customerOrgExp = [];
  editedEmployee.value.customerOrgExp.push({
    current: false,
    name: '',
    years: 0
  });
}

function deleteExperience(index) {
  editedEmployee.value.customerOrgExp.splice(index, 1);
}
</script>
