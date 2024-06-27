<template>
  <v-dialog v-model="dialog" persistent @click:outside="toggleCancelConfirmation = true">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between beta_header_style">
        <h3 class="text-white px-2">Editing {{ isUser ? 'My Profile' : fullName }}</h3>
      </v-card-title>
      <div v-if="submitting" class="py-10 px-6">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <v-container v-else fluid>
        <v-form ref="form" v-model="valid" lazy-validation class="my-1 mx-xl-5 mx-lg-5 mx-md-0">
          <v-expansion-panels v-model="formTabs" variant="accordion" multiple>
            <v-expansion-panel title="Employee" value="Employee">
              <v-expansion-panel-text>
                <div>Editing: {{ formTabs }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel title="Personal" value="Personal Information">
              <v-expansion-panel-text>
                <div>Editing: {{ formTabs }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel title="Clearance" value="Clearance">
              <v-expansion-panel-text>
                <div>Editing: {{ formTabs }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel title="Contracts" value="Contracts">
              <v-expansion-panel-text>
                <div>Editing: {{ formTabs }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <awards-form :formTabs="formTabs"></awards-form>
            <v-expansion-panel title="Certifications" value="Certifications">
              <v-expansion-panel-text>
                <div>Editing: {{ formTabs }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel title="Education" value="Education">
              <v-expansion-panel-text>
                <div>Editing: {{ formTabs }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel title="Foreign Languages" value="Foreign Languages">
              <v-expansion-panel-text>
                <div>Editing: {{ formTabs }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel title="Other Information" value="Other Information">
              <v-expansion-panel-text>
                <div>Editing: {{ formTabs }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-card-actions>
            <!-- Form action buttons -->
            <v-btn id="employeeCancelBtn" variant="text" class="ma-2" @click="toggleCancelConfirmation = true"
              >Cancel</v-btn
            >
            <v-btn id="employeeSubmitBtn" variant="outlined" class="ma-2" color="success" @click="submit()">
              <v-icon class="mr-1">mdi-content-save</v-icon>Submit
            </v-btn>
            <!-- End form action buttons -->
          </v-card-actions>
        </v-form>
      </v-container>
      <form-cancel-confirmation
        :toggleSubmissionConfirmation="toggleCancelConfirmation"
        type="cancel"
      ></form-cancel-confirmation>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import AwardsForm from '@/components/employee-beta/forms/AwardsForm.vue';
import FormCancelConfirmation from '@/components/modals/FormCancelConfirmation.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');

const props = defineProps(['editing', 'employee', 'contracts']);
const isUser = inject('isUser');
const dialog = ref(false);

const formTabs = ref(null); //TODO: Sync up current tabs on edit form and info cards
const submitting = ref(false);
const toggleCancelConfirmation = ref(false);
const valid = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const fullName = computed(() => {
  return `${props.employee.firstName} ${props.employee.lastName}`;
});

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(() => {
  emitter.on('editing', (cardName) => {
    formTabs.value = [cardName];
    dialog.value = true;
  });
  // Starts listener to see if the user cancelled to submit the form
  emitter.on('canceled-cancel', () => {
    toggleCancelConfirmation.value = false;
  });
  emitter.on('confirmed-cancel', async () => {
    toggleCancelConfirmation.value = false;
    await cancel();
    dialog.value = false;
  });
});

onBeforeUnmount(() => {
  emitter.off('editing');
  emitter.off('canceled-cancel');
  emitter.off('confirmed-cancel');
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

//TODO: submit
function submit() {}

//TODO: cancel
function cancel() {}
</script>
