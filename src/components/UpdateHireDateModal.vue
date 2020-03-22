<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">
          Are you sure you want to change the hire date for {{ employeeName }} from {{ oldDate }} to {{ newDate }}?
        </v-card-title>
        <v-card-text>
          This will adjust all budget dates the user may have
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" text @click.native="emit(`cancel-hireDate-change`)">
            No, don't change
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click.native="emit(`confirm-hireDate-change`)">Change hire date</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  props: ['employeeName', 'oldDate', 'newDate', 'activate'],
  methods: {
    emit(msg, data) {
      if (data) {
        window.EventBus.$emit(msg, data);
      } else {
        window.EventBus.$emit(msg);
      }
    }
  }
};
</script>
