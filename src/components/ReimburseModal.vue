<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to reimburse these expenses?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" text @click.native="emit(`canceled-reimburse`)">No</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="green" text @click.native="emit(`confirm-reimburse`)">Reimburse</v-btn>
          <v-spacer></v-spacer>
          <v-switch label="Include expense on feed?" v-model="willShow"></v-switch>
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
    window.EventBus.$emit(`${msg}-${this.willShow}`, data);
    this.willShow = false;
  } else {
    // data does not exist
    if (msg == `canceled-reimburse`) {
      window.EventBus.$emit(msg);
    }
    window.EventBus.$emit(`${msg}-${this.willShow}`);
    this.willShow = false;
  }
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  props: ['activate'], // dialog activator
  methods: {
    emit
  },
  data() {
    return {
      willShow: false
    };
  }
};
</script>
