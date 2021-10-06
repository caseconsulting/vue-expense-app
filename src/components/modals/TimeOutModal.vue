<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Session Timed Out</v-card-title>
        <v-card-text>Your session has timed out. Please login again.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="gray darken-1"
            text
            @click.native="
              emit('relog');
              activate = false;
            "
            >Log In</v-btn
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
 * Emits a message.
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
  methods: {
    emit
  },
  props: ['toggleTimeOut'], // dialog activator
  watch: {
    toggleTimeOut: watchToggleTimeOut
  }
};
</script>
