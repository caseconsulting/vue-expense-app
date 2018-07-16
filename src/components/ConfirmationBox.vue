<template>
<v-layout row justify-center>
  <v-dialog v-model="activate" persistent max-width="290">
    <v-card>
      <v-card-title class="headline">You've reached the budget limit for this expense type</v-card-title>
      <v-card-text>
        <pre>
          {{expense}}
        </pre>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" flat @click.native="emit('canceled',false)">Disagree</v-btn>
        <v-btn color="green darken-1" flat @click.native="emit('confirm')">Agree</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</v-layout>
</template>

<script>
export default {
  props: ['expense', 'activate'],
  methods: {
    emit(msg, data) {
      if (data) {
        EventBus.$emit(msg, data);
      } else {
        EventBus.$emit(msg);
      }
    }
  },

}
</script>
