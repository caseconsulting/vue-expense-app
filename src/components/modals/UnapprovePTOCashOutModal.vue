<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="375">
      <v-card>
        <v-card-title class="headline">Are you sure you want to unapprove PTO Cash Out?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            text
            @click.native="
              emit(`canceled-unapprove-cash-out`);
              activate = false;
            "
          >
            No, keep approved
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            id="confirmUnapprove"
            text
            @click.native="
              emit(`confirm-unapprove-cash-out`);
              activate = false;
            "
          >
            Unapprove
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
    window.EventBus.$emit(msg, data);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
  }
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleUnreimburseModal
 */
function watchToggleUnapproveModal() {
  this.activate = true;
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
    'toggleUnapproveModal' // dialog activator
  ],
  watch: {
    toggleUnapproveModal: watchToggleUnapproveModal
  }
};
</script>
