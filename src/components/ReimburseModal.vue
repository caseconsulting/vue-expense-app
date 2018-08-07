<template>
<v-layout row justify-center>
  <v-dialog v-model="activate" persistent max-width="350">
    <v-card>
      <v-card-title class="headline">Are you sure you want to reminburse these expenses?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="info" flat @click.native="emit(`canceled-reminburse`)">No</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="green" flat @click.native="emit(`confirm-reminburse`)">Reminburse</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</v-layout>
</template>

<script>
export default {
  props: ['activate'],
  methods: {
    emit(msg, data) {
      if (data) {
        EventBus.$emit(msg, data);
      } else {
        EventBus.$emit(msg);
      }
    }
  }
};
</script>
