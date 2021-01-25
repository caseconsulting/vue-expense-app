<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to reimburse these expenses?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" text @click.native="activate = false">No</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="green"
            text
            @click.native="
              emit(`confirm-reimburse`);
              activate = false;
            "
            >Reimburse</v-btn
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
    this.$emit(msg, data);
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
  data() {
    return {
      activate: false // dialog activator
    };
  },
  methods: {
    emit
  },
  props: ['toggleReimburseModal'], // dialog activator
  watch: {
    toggleReimburseModal: function () {
      this.activate = true;
    }
  }
};
</script>
