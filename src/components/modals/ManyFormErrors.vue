<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="330">
      <v-card>
        <!-- Errors across tabs -->
        <v-card-title class="headline">Error(s) found across tabs</v-card-title>
        <v-card-text>
          <ul>
            <li v-for="tab in Object.keys(errorTabs)" :key="tab">
              {{ tab }}: found {{ errorTabs[tab] }} invalid entr{{ isPlural(errorTabs[tab]) }}
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click.native="
              emit('canceled-form');
              activate = false;
            "
            >Ok</v-btn
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
// |                      Methods                     |
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

/**
 * changes text based on if there is one or if there is more than one
 *
 * @param val - the number that we go off of
 */
function isPlural(val) {
  if (val === 1) {
    return 'y';
  }
  return 'ies';
} // isPlural

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
    emit,
    isPlural
  },
  props: [
    'errorTabs',
    'toggleSubmissionConfirmation' // dialog activator
  ],
  watch: {
    toggleSubmissionConfirmation: watchToggleSubmissionConfirmation
  }
};
</script>

<style scoped>
li {
  color: red;
}
</style>
