<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-text class="font-weight-medium text-h6">Error: cannot delete {{ type }}</v-card-text>
        <v-card-text>Cannot delete {{ type }}. Expenses for this {{ type }} exist.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="gray darken-1"
            variant="text"
            @click="
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
  this.emitter.emit(msg);
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
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

// The watcher above and this emitter kind of do the same thing, but the watcher didn't update when it should've in
// some cases. To fix this, I used this event instead (fired in ExpenseTypes.vue), but I didn't delete the watcher to
// avoid breaking anything else.

/**
 * Created lifecycle hook - sets up event listeners
 */
function created() {
  this.emitter.on('delete-expense-type-error-show', () => {
    this.activate = true;
  });
}

/**
 * Before Unmount lifecycle hook - removes event listeners
 */
function beforeUnmount() {
  this.emitter.off('delete-expense-type-error-show');
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  beforeUnmount,
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
