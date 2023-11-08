<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-text class="text-h6 font-weight-medium">Are you sure you want to reimburse these expenses?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            variant="text"
            @click="
              emitter.emit('cancel-reimburse');
              activate = false;
            "
            >No</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            id="reimburse"
            variant="text"
            @click="
              emitter.emit('confirm-reimburse');
              activate = false;
            "
          >
            Reimburse
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

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleReimburseModal
 */
function watchToggleReimburseModal() {
  this.activate = this.toggleReimburseModal;
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
  props: ['toggleReimburseModal'], // dialog activator
  watch: {
    toggleReimburseModal: watchToggleReimburseModal
  }
};
</script>
