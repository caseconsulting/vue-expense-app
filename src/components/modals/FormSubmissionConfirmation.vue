<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to submit?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            id="submitNoBtn"
            color="red"
            text
            @click.native="
              emit(`canceled-${type}`);
              activate = false;
            "
            :loading="!activate || submitting"
            :disabled="!activate || submitting"
          >
            No
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            id="submitYesBtn"
            color="green darken-1"
            text
            @click.native="
              emit(`confirmed-${type}`);
              activate = false;
            "
            :loading="!activate || submitting"
            :disabled="!activate || submitting"
          >
            Yes
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
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleSubmissionConfirmation
 */
function watchToggleSubmissionConfirmation() {
  this.activate = this.toggleSubmissionConfirmation;
} // watchToggleSubmissionConfirmation

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
    'submitting',
    'toggleSubmissionConfirmation', // dialog activator,
    'type' //sends appropriate emits based on where its called
  ],
  watch: {
    toggleSubmissionConfirmation: watchToggleSubmissionConfirmation
  }
};
</script>
