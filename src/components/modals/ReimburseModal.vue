<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to reimburse these expenses?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click.native="activate = false">No</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            id="reimburse"
            text
            @click.native="
              emit(`confirm-reimburse`);
              activate = false;
            "
            >Reimburse</v-btn
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
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleReimburseModal
 */
function watchToggleReimburseModal() {
  this.activate = true;
} // watchToggleReimburseModal

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
  props: ['toggleReimburseModal'], // dialog activator
  watch: {
    toggleReimburseModal: watchToggleReimburseModal
  }
};
</script>
