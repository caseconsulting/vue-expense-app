<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Error: cannot delete {{ type }}</v-card-title>
        <v-card-text>Cannot delete {{ type }}. Expenses for this {{ type }} exist.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="gray darken-1"
            text
            @click.native="
              emit(`invalid-${type}-delete`);
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
 * watcher for toggleDeleteErrorModal
 */
function watchToggleDeleteErrorModal() {
  this.activate = true;
} // watchToggleDeleteErrorModal

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
    'toggleDeleteErrorModal', // dialog activator
    'type' // type of object being deleted
  ],
  watch: {
    toggleDeleteErrorModal: watchToggleDeleteErrorModal
  }
};
</script>
