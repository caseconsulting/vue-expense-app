<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to delete?</v-card-title>
        <v-card-text>Are you sure you want to delete this {{ type }}?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" flat @click.native="emit(`canceled-delete-${type}`)">No, keep {{ type }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" flat @click.native="emit(`confirm-delete-${type}`)">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  props: ['type', 'activate'],
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
