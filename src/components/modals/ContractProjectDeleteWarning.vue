<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <!-- Errors across tabs -->
        <v-card-title class="headline">Cannot delete item.</v-card-title>
        <v-card-text>
          <span>Delete the following relationships before deleting item.</span>
          <p v-for="r in relationships" :key="r.project.id">
            <span>{{ r.project }}</span>
          <ul> <li v-for="e in r.employees" :key="e.id">{{e.id}}</li></ul></p>
         
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click.native="
              emit('canceled-form');
              activate = false;
            "
          >
            Ok
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions> </v-card
    ></v-dialog>
  </div>
</template>
<script>
/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

function watchToggleContractProjectDeleteWarning() {
  this.activate = !this.activate;
}

export default {
  data() {
    return {
      activate: false
    };
  },
  methods: {
    emit
  },
  watch: {
    toggleModal: watchToggleContractProjectDeleteWarning
  },
  props: ['toggleModal', 'relationships']
};
</script>
