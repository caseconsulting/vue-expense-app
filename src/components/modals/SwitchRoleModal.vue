<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">What Role?</v-card-title>
        <v-card-text>dropdown</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn>Ok</v-btn>
          <v-btn>Cancel</v-btn>
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
 * watcher for toggleSwitchRole
 */
function watchToggleSwitchRole() {
  this.activate = this.toggleSwitchRole;
} // watchToggleSwitchRole

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
  props: ['toggleSwitchRole'], // dialog activator
  watch: {
    toggleSwitchRole: watchToggleSwitchRole
  }
};
</script>
