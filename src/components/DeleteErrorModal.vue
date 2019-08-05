<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
<<<<<<< HEAD:src/components/ExpenseTypeDeleteModel.vue
        <v-card-title class="headline">Error: cannot delete expense</v-card-title>
        <v-card-text>Cannot delete expense type. Expenses for this type exist.</v-card-text>
=======
        <v-card-title class="headline">Error: cannot delete {{ type }}</v-card-title>
        <v-card-text>Cannot delete {{ type }}. Expenses for this {{ type }} exist.</v-card-text>
>>>>>>> 731-employee-page-action-icons: added action icons to employees page and changed delete error modal to be reusable:src/components/DeleteErrorModal.vue
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" flat @click.native="emit(`invalid-${type}-delete`)">Ok</v-btn>
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
