<template>
  <div class="ViewCustomModal">
    <v-dialog v-model="toggleModal" max-width="650">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between beta_header_style">
          <h3 v-if="!isMobile()" class="text-white px-2">EEO Compliance Information</h3>
          <h3 v-else class="text-white px-2">EEO Info</h3>
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
        <!-- Main EEO information -->
        <v-row v-if="isAdmin || isUser" class="mx-1 my-1">
          <v-col>
            <v-row>
              <v-col class="mt-2">
                <b v-if="!isMobile()">EEO Compliance Reporting:</b>
                <b v-else>EEO Reporting:</b>
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
                  :class="isMobile() ? 'mb-4' : ''"
                >
                  <v-btn
                    @click="emit('show-all', true)"
                    class="font-weight-bold text-caption text-blue pr-3"
                    :density="btnDensity"
                    variant="plain"
                    >Show All</v-btn
                  >
                  <v-btn
                    @click="emit('show-all', false)"
                    class="font-weight-bold text-caption text-blue"
                    :density="btnDensity"
                    variant="plain"
                    >Hide All</v-btn
                  >
                </span>
              </v-col>
            </v-row>

            <!-- User declines to self identify -->
            <v-row v-if="model.eeoDeclineSelfIdentify">
              <v-col>
                <sensitive-data-field class="ml-2 mb-1" label="Status" :value="`Declined to self-identify.`" />
              </v-col>
            </v-row>
            <!-- End deny self identification -->

            <!-- Fully completed form -->
            <v-row
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
              no-gutters
            >
              <v-col cols="12">
                <sensitive-data-field class="mb-1" label="Gender" :value="model.eeoGender.text" />
              </v-col>
              <v-col cols="12">
                <sensitive-data-field
                  class="mb-1"
                  label="Hispanic or Latino"
                  :value="model.eeoHispanicOrLatino.value ? 'Yes' : 'No'"
                />
              </v-col>
              <v-col cols="12">
                <sensitive-data-field class="mb-1" label="Race or Ethnicity" :value="model.eeoRaceOrEthnicity.text" />
              </v-col>
              <v-col cols="12">
                <sensitive-data-field class="mb-1" label="Job Category" :value="model.eeoJobCategory.text" />
              </v-col>
              <v-col cols="12">
                <sensitive-data-field class="mb-1" label="Disability" :value="model.eeoHasDisability ? 'Yes' : 'No'" />
              </v-col>
              <v-col cols="12">
                <sensitive-data-field
                  class="mb-1"
                  label="Protected Veteran"
                  :value="model.eeoIsProtectedVeteran ? 'Yes' : 'No'"
                />
              </v-col>
            </v-row>
            <!-- End fully completed form -->

            <!-- Partially completed form -->
            <v-row
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
              <v-col>
                <p><b>Status: </b>Form is partially complete.</p>
              </v-col>
            </v-row>
            <!-- End partially completed form -->

            <!-- Empty form -->
            <v-row v-else class="ml-2">
              <v-col
                ><p><b>Status: </b>Form not yet completed.</p></v-col
              >
            </v-row>
            <!-- Empty form -->
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import SensitiveDataField from '../SensitiveDataField.vue';
import { inject, computed } from 'vue';
import { isEmpty, isMobile } from '../../../utils/utils';

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
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

const btnDensity = computed(() => {
  return isMobile() ? 'compact' : 'default';
});

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
