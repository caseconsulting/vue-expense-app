<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Session Time Out Warning</v-card-title>
        <v-card-text>Warning: Your session will time out in 5 minutes. Please complete any progress.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" flat @click.native="emit('sessionContinue')">Ok</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  props: ['activate'],
  methods: {
    emit(msg) {
      window.EventBus.$emit(msg);
    }
  }
};
</script>
