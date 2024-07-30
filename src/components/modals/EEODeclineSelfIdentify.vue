<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="500">
      <v-card>
        <v-card-text class="font-weight-medium text-h6">Are you sure you want to decline to self-identify?</v-card-text>
        <v-card-text>
          EEOC prefers employees self-identify as to race and gender. If you refuse to identify, CASE will complete the
          information on your behalf based on other records or visual observation.
        </v-card-text>
        <v-card-text>
          For more information please refer to
          <a
            href="https://eeocdata.org/?ReturnUrl=%2FEEO1%2F3c2e79be-28c1-446b-8d15-bb82a6ccde76%2FEligible"
            target="_blank"
            >EEOCData.org</a
          >
          or send a message to Paul Farmer.
        </v-card-text>
        <v-card-actions>
          <v-row no-gutters>
            <v-col :cols="isMobile() ? '12' : '5'">
              <v-btn
                color="red"
                variant="text"
                class="d-flex flex-row"
                :class="!isMobile() ? 'ml-5' : ''"
                @click="
                  emit(`cancel-decline-self-identify`);
                  activate = false;
                "
              >
                No, take me back.
              </v-btn>
            </v-col>
            <v-col>
              <v-btn
                color="green-darken-1"
                variant="text"
                class="d-flex flex-row"
                @click="
                  emit(`confirm-decline-self-identify`);
                  activate = false;
                "
              >
                Yes, decline self-identify.
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';
import { isMobile } from '../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps([
  'toggleDeclineSelfIdentifyModal' // dialog activator
]);
const emitter = inject('emitter');

const activate = ref(false); // dialog activator

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

// Watcher for modal
watch(
  () => props.toggleDeclineSelfIdentifyModal,
  () => {
    activate.value = props.toggleDeclineSelfIdentifyModal;
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    emitter.emit(msg, data);
  } else {
    // data does not exist
    emitter.emit(msg);
  }
} // emit
</script>
