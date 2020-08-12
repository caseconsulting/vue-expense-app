<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">How do you want to create an expense?</v-card-title>
        <v-card-text> Would you like to create a blank expense or start from a reciept?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" text @click.native="emit(`canceled-delete-${type}`)">Create New Expense</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click.native="emit(`confirm-delete-${type}`)">Upload From Receipt</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  methods: {
    emit
  },
  props: [
    'activate', // dialog activator
    'type', // type of object being deleted
    'deleteInfo' //delete info to be displayed
  ]
};
</script>
