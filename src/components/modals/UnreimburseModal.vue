<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to unreimburse?</v-card-title>
        <v-card-text>
          This will unreimburse the expense to pending and uncarry any overdrafts due to this expense
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" text @click.native="emit(`canceled-unreimburse-expense`)">
            No, keep reimbursed
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click.native="emit(`confirm-unreimburse-expense`)">Unreimburse</v-btn>
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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  methods: {
    emit
  },
  props: [
    'activate', // dialog activator
    'expense' // expense to unreimburse
  ]
};
</script>
