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
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
function emit(msg, data) {
  if (data) {
    window.EventBus.$emit(msg, data);
  } else {
    window.EventBus.$emit(msg);
  }
}

export default {
  props: ['activate'],
  methods: {
    emit
  }
};
</script>
