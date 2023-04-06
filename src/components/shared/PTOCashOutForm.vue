<template>
  <v-card>
    <v-card-title class="header_style"><h3>Cash Out PTO</h3> </v-card-title>
    <v-card-text>
      <v-form ref="PTOCashOutForm" v-model="valid" lazy-validation>
        <v-text-field
          prepend-icon="mdi-clock-outline"
          class="pt-5"
          :rules="[...getRequiredRules(), ...getNumberRules()]"
          v-model="hoursRequested"
          label="Number of Hours Requested to be Paid Out"
          ref="PTOCashOut"
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <!-- Cancel Button -->
      <v-btn color="white " @click="emit('cancel-pto-cash-out-form')" class="ma-2" elevation="2">
        <v-icon class="mr-1">cancel</v-icon>Cancel
      </v-btn>
      <!-- Submit Button -->
      <v-btn outlined class="ma-2" color="success" :disabled="!valid"> <v-icon class="mr-1">save</v-icon>Submit </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { getNumberRules, getRequiredRules } from '@/shared/validationUtils.js';
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  console.log('sent');
  window.EventBus.$emit(msg);
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|
export default {
  data() {
    return {
      show: false,
      hoursRequested: null,
      valid: false
    };
  },
  methods: {
    getNumberRules,
    getRequiredRules,
    emit
  }
};
</script>
