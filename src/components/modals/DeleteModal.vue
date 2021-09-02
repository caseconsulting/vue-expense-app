<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to delete?</v-card-title>
        <v-card-text> Are you sure you want to delete this {{ type }}? {{ deleteInfo }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            text
            @click.native="
              emit(`canceled-delete-${type}`);
              activate = false;
            "
            >No, keep {{ type }}</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            id="confirmDelete"
            text
            @click.native="
              emit(`confirm-delete-${type}`);
              activate = false;
            "
            >Delete</v-btn
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
 * watcher for toggleDeleteModal
 */
function watchToggleDeleteModal() {
  this.activate = true;
} // watchToggleDeleteModal

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
    'toggleDeleteModal', // dialog activator
    'type', // type of object being deleted
    'deleteInfo' //delete info to be displayed
  ],
  watch: {
    toggleDeleteModal: watchToggleDeleteModal
  }
};
</script>
