<template>
  <div class="ViewCustomModal">
    <v-dialog v-model="toggleModal" max-width="650">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between beta_header_style">
          <h3 class="text-white px-2">EEO Compliance Information</h3>
          <div>
            <!-- Edit Button -->
            <v-btn v-if="isAdmin || isUser" @click="toggleEdit()" density="comfortable" variant="text" icon="">
              <v-tooltip activator="parent" location="top"> Edit EEO Info </v-tooltip>
              <v-icon id="edit" color="white"> mdi-pencil </v-icon>
            </v-btn>
            <!-- Collapse -->
            <v-btn @click="toggleModal = false" variant="text" icon="">
              <v-tooltip activator="parent" location="top"> Collapse </v-tooltip>
              <v-icon id="collapse" color="white">mdi-arrow-collapse</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <div v-if="isAdmin || isUser" class="ma-4">
          <p class="mt-2">
            <b>EEO Compliance Reporting:</b>
            <span
              v-if="
                !model.eeoDeclineSelfIdentify &&
                !isEmpty(model.eeoGender) &&
                !isEmpty(model.eeoHispanicOrLatino) &&
                !isEmpty(model.eeoRaceOrEthnicity) &&
                !isEmpty(model.eeoJobCategory) &&
                !isEmpty(model.eeoHasDisability) &&
                !isEmpty(model.eeoIsProtectedVeteran)
              "
              class="float-right"
            >
              <v-btn
                @click="emit('show-all', true)"
                class="font-weight-bold text-caption text-blue pr-3"
                variant="plain"
                >Show All</v-btn
              >
              <v-btn @click="emit('show-all', false)" class="font-weight-bold text-caption text-blue" variant="plain"
                >Hide All</v-btn
              >
            </span>
          </p>

          <sensitive-data-field
            class="ml-2 mb-1"
            v-if="model.eeoDeclineSelfIdentify"
            label="Status"
            :value="`Declined to self-identify${declinedExtraText}.`"
          />
          <div
            v-else-if="
              !model.eeoDeclineSelfIdentify &&
              !isEmpty(model.eeoGender) &&
              !isEmpty(model.eeoHispanicOrLatino) &&
              !isEmpty(model.eeoRaceOrEthnicity) &&
              !isEmpty(model.eeoJobCategory) &&
              !isEmpty(model.eeoHasDisability) &&
              !isEmpty(model.eeoIsProtectedVeteran)
            "
            class="ml-2"
          >
            <sensitive-data-field class="mb-1" label="Gender" :value="model.eeoGender.text" />
            <sensitive-data-field
              class="mb-1"
              label="Hispanic or Latino"
              :value="model.eeoHispanicOrLatino.value ? 'Yes' : 'No'"
            />
            <sensitive-data-field class="mb-1" label="Race or Ethnicity" :value="model.eeoRaceOrEthnicity.text" />
            <sensitive-data-field class="mb-1" label="Job Category" :value="model.eeoJobCategory.text" />
            <sensitive-data-field class="mb-1" label="Disability" :value="model.eeoHasDisability ? 'Yes' : 'No'" />
            <sensitive-data-field
              class="mb-1"
              label="Protected Veteran"
              :value="model.eeoIsProtectedVeteran ? 'Yes' : 'No'"
            />
          </div>
          <div
            v-else-if="
              !isEmpty(model.eeoGender) ||
              !isEmpty(model.eeoHispanicOrLatino) ||
              !isEmpty(model.eeoRaceOrEthnicity) ||
              !isEmpty(model.eeoJobCategory) ||
              !isEmpty(model.eeoHasDisability) ||
              !isEmpty(model.eeoIsProtectedVeteran)
            "
            class="ml-2"
          >
            <p><b>Status: </b>Form is partially complete.</p>
          </div>
          <div v-else class="ml-2">
            <p><b>Status: </b>Form not yet completed.</p>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import SensitiveDataField from '../SensitiveDataField.vue';
import { inject } from 'vue';
import { isEmpty } from '../../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');
const props = defineProps(['model', 'title']);
const toggleModal = defineModel();

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - The data to emit
 */
function emit(msg, data) {
  emitter.emit(msg, data);
} // emit

function toggleEdit() {
  toggleModal.value = false;
  emitter.emit('edit-EEO', props.title);
}
</script>
