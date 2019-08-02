<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Error: cannot delete expense</v-card-title>
        <v-card-text>Cannot delete expense type. Exenses for this type exist.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" flat @click.native="emit('invalid-expense-type-delete')">Ok</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  props: ['activate', 'type', 'header', 'body'],
  methods: {
    emit(msg) {
      window.EventBus.$emit(msg);
    }
  }
};
</script>
