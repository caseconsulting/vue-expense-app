<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5">Are you sure you want to decline to self-identify?</v-card-title>
        <v-card-text>
          EEOC prefers employees self-identify as to race and gender. If you refuses to identify, CASE will complete the
          information on your behalf based on other records or visual observation.
        </v-card-text>
        <v-card-text>
          For more information please refer to
          <a
            href="https://eeocdata.org/?ReturnUrl=%2FEEO1%2F3c2e79be-28c1-446b-8d15-bb82a6ccde76%2FEligible"
            target="_blank"
          >
            EEOCData.org
          </a>
          or send a message to Paul Farmer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            variant="text"
            @click.native="
              emit(`cancel-decline-self-identify`);
              activate = false;
            "
          >
            No, take me back.
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="green-darken-1"
            variant="text"
            @click.native="
              emit(`confirm-decline-self-identify`);
              activate = false;
            "
          >
            Yes, decline self-identify.
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
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
    this.emitter.emit(msg, data);
  } else {
    // data does not exist
    this.emitter.emit(msg);
  }
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for modal
 */
function watchDeclineSelfIdentifyModal() {
  if (this.toggleDeclineSelfIdentifyModal) this.activate = true;
} // watchToggleUnreimburseModal

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      activate: false // dialog activator
    };
  },
  methods: {
    emit
  },
  props: [
    'toggleDeclineSelfIdentifyModal' // dialog activator
  ],
  watch: {
    toggleDeclineSelfIdentifyModal: watchDeclineSelfIdentifyModal
  }
};
</script>
