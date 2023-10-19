<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="text-h5">Session Timed Out</v-card-title>
        <v-card-text>Your session has timed out. Please login again.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="gray darken-1"
            variant="text"
            @click.native="
              emitter.emit('timeout-acknowledged');
              activate = false;
            "
          >
            Ok
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
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleTimeOut
 */
function watchToggleTimeOut() {
  this.activate = this.toggleTimeOut;
} // watchToggleTimeOut

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
  props: ['toggleTimeOut'], // dialog activator
  watch: {
    toggleTimeOut: watchToggleTimeOut
  }
};
</script>
