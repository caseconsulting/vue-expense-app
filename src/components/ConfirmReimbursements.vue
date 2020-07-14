<template>
  <div>
    <v-card class="slide-in-blurred-right">
      <v-card-title class="subtitle-2">
        <v-flex lg12 class="headline">Confirm Reimbursements</v-flex>
        <v-spacer></v-spacer>
        <v-flex lg12>
          <v-btn color="info" text @click.native="emit(`canceled-reimburse`)">No</v-btn>

          <v-btn color="green" text @click="emit('confirm-reimburse')">Reimburse</v-btn>
        </v-flex>
      </v-card-title>
    </v-card>
  </div>
</template>

<script>
/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    window.EventBus.$emit(msg);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
  }
} // emit

export default {
  methods: {
    emit
  }
};
</script>
