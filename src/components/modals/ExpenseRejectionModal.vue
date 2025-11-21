<template>
  <v-card>
    <v-card-title class="header_style d-flex align-center">Expense Rejection</v-card-title>
    <v-card-text>
      <v-radio-group v-model="selectedDenialType" inline>
        <v-row>
          <v-col
            v-for="denialType of denialTypes"
            :key="denialType"
            :cols="12 / denialTypes.length"
            class="d-flex justify-center"
          >
            <v-radio :value="denialType" :label="denialType.title"></v-radio>
          </v-col>
        </v-row>
      </v-radio-group>
      <div class="font-italic text-caption">
        {{ selectedDenialType.info }}
      </div>
      <div class="text-caption my-3">Email list: {{ employeeNames }}</div>
      <v-textarea v-model="reason" autofocus label="Reasoning"></v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        @click="
          emitter.emit('close-expenses-rejection');
          activate = false;
        "
        >Cancel</v-btn
      >
      <v-btn
        color="green"
        id="reimburse"
        variant="text"
        :disabled="reason.length < 1"
        @click="
          emitter.emit('confirm-expenses-rejection', { field: selectedDenialType.field, reason });
          emitter.emit('close-expenses-rejection');
          activate = false;
        "
      >
        {{ selectedDenialType.title }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import _map from 'lodash/map';
import { computed, inject, ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['expenses', 'defaultType']);
const emitter = inject('emitter');

const denialTypes = ref([
  {
    title: 'Request Revisal',
    info: 'Requesting a revision will send an email to the employee(s) listed below, along with the provided reasoning. The expense(s) will not reappear on the Reimbursements page until the user(s) have resubmitted them.',
    field: 'rejections.softRejections'
  },
  {
    title: 'Reject Expense',
    info: 'Rejecting an expense will send an email to the employee(s) listed below, along with the provided reasoning. The expense(s) will no longer appear on the Reimbursements page, and the user(s) will not be able to delete or resubmit the rejected expense.',
    field: 'rejections.hardRejections'
  }
]);
let type = props.defaultType === 'hard' ? 1 : 0;
const selectedDenialType = ref(denialTypes.value[type]);
const reason = ref('');

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the list of comma separated names from the expenses.
 *
 * @returns String - The list of employee names
 */
const employeeNames = computed(() => {
  let names = Array.from(new Set(_map(props.expenses, (e) => e.employeeName)));
  return names?.join(', ');
}); // employeeNames
</script>
