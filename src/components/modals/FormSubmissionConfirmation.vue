<template>
  <div>
    <v-dialog v-model="activate" max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to submit?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            id="submitNoBtn"
            color="gray darken-1"
            text
            @click.native="
              emit('canceled');
              activate = false;
              loading = true;
            "
            :loading="loading"
            >No</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            id="submitYesBtn"
            color="red"
            text
            @click.native="
              emit('confirmed');
              activate = false;
              loading = true;
            "
            :loading="loading"
            >Yes</v-btn
          >
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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      activate: false, // dialog activator
      loading: false // loading
    };
  },
  methods: {
    emit
  },
  props: [
    'toggleSubmissionConfirmation' // dialog activator
  ],
  watch: {
    toggleSubmissionConfirmation: function () {
      this.activate = true;
    },
    activate: function () {
      if (this.activate) {
        this.loading = false;
      }
    }
  }
};
</script>
