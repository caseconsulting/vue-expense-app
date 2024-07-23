<template>
  <v-dialog v-model="editing" persistent scrollable @click:outside="toggleCancelConfirmation = true">
    <v-card>
      <v-card-title
        class="d-flex align-center justify-space-between beta_header_style"
        style="position: sticky; top: 0; z-index: 2"
      >
        <h3 class="text-white px-2">Editing {{ isUser ? 'My Profile' : fullName }}</h3>
        <v-btn
          id="modalCloseBtn"
          align-self="end"
          density="compact"
          variant="text"
          icon=""
          @click="toggleCancelConfirmation = true"
          ><v-icon size="large">mdi-window-close</v-icon></v-btn
        >
      </v-card-title>
      <div v-if="submitting" class="py-10 px-6">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <v-container v-else fluid>
        <v-form ref="form" v-model="valid" lazy-validation class="my-1 mx-xl-5 mx-lg-5 mx-md-0">
          <v-expansion-panels v-model="formTabs" variant="accordion" multiple>
            <base-form title="Personal" value="Personal Information">
              <personal-info-form v-model="editedEmployee"></personal-info-form>
            </base-form>
            <base-form title="Clearance" value="Clearance">
              <div>Editing: {{ formTabs }}</div>
            </base-form>
            <base-form title="Contracts" value="Contracts">
              <div>Editing: {{ formTabs }}</div>
            </base-form>
            <base-form title="Certifications + Awards" value="Certifications + Awards">
              <div>Editing: {{ formTabs }}</div>
            </base-form>
            <base-form title="Tech, Skills, and Languages" value="Tech, Skills, and Languages">
              <v-row style="overflow-x: auto">
                <v-col style="min-width: 380px">
                  <technologies-form v-model="editedEmployee"></technologies-form>
                </v-col>
                <v-divider vertical inset></v-divider>
                <v-col style="min-width: 380px">
                  <languages-form v-model="editedEmployee"></languages-form>
                </v-col>
              </v-row>
            </base-form>
            <base-form title="Job Experience" value="Past Experience">
              <div>Editing: {{ formTabs }}</div>
            </base-form>
            <base-form title="Education" value="Education">
              <div>Editing: {{ formTabs }}</div>
            </base-form>
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
import BaseForm from '@/components/employee-beta/forms/BaseForm.vue';
import FormCancelConfirmation from '@/components/modals/FormCancelConfirmation.vue';
import { cloneDeep } from 'lodash';
import { computed, inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import LanguagesForm from './LanguagesForm.vue';
import TechnologiesForm from './TechnologiesForm.vue';
import PersonalInfoForm from './PersonalInfoForm.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');

const props = defineProps(['employee', 'contracts']);
const editedEmployee = ref(cloneDeep(props.employee));
const isUser = inject('isUser');
const editing = defineModel();
const formTabs = ref([]); //TODO: Sync up current tabs on edit form and info cards
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
    editing.value = true;
  });
  // Starts listener to see if the user cancelled to submit the form
  emitter.on('canceled-cancel', () => {
    toggleCancelConfirmation.value = false;
  });
  emitter.on('confirmed-cancel', async () => {
    toggleCancelConfirmation.value = false;
    await cancel();
    editing.value = false;
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
