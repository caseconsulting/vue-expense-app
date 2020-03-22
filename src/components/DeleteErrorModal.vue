<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Error: cannot delete {{ type }}</v-card-title>
        <v-card-text>Cannot delete {{ type }}. Expenses for this {{ type }} exist.</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" text @click.native="emit(`invalid-${type}-delete`)">Ok</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  props: ['activate', 'type'],
  methods: {
    emit(msg) {
      window.EventBus.$emit(msg);
    }
  }
};
</script>
