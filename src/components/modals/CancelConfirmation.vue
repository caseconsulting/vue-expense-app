<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-text class="text-h5">Are you sure you want to cancel?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- id needed for nigthwatch tests -->
          <v-btn
            id="submitNoBtn"
            color="red"
            variant="text"
            @click.native="
              activate = false;
              loading = true;
              emit(`backout-canceled-${type}`);
            "
            :loading="loading"
            :disabled="loading"
          >
            No
          </v-btn>
          <v-spacer></v-spacer>
          <!-- id needed for nigthwatch tests -->
          <v-btn
            id="submitYesBtn"
            color="green-darken-1"
            variant="text"
            @click.native="
              emit(`backout-confirmed-${type}`);
              activate = false;
              loading = true;
            "
            :loading="loading"
            :disabled="loading"
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
  this.emitter.emit(msg);
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
  this.loading = false;
} // watchToggleSubmissionConfirmation

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      activate: false, // dialog activator
      loading: false // loading circle
    };
  },
  methods: {
    emit
  },
  props: [
    'toggleSubmissionConfirmation', // dialog activator,
    'type' //sends appropriate emits based on where its called
  ],
  watch: {
    toggleSubmissionConfirmation: watchToggleSubmissionConfirmation
  }
};
</script>
