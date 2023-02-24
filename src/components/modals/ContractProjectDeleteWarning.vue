<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="450">
      <v-card>
        <!-- Errors across tabs -->
        <v-card-title class="headline">Cannot delete item.</v-card-title>
        <v-card-text>
          <span>Delete the following relationships before deleting item:</span>
          <br/>
          <br/>
          <p v-for="r in relationships" :key="r.project.id">
            <span><b>Contract:</b> {{ r.contract }}, <b>Prime:</b> {{ r.prime }}, <b>Project:</b> {{ r.project.projectName }}</span>
          <ul> <li v-for="e in r.employees" :key="e.id">{{`${e.firstName} ${e.lastName}`}}</li></ul></p>
         
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

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for modal toggle
 */
function watchToggleContractProjectDeleteWarning() {
  console.log(this.relationships)
  this.activate = !this.activate;
} // watchToggleContractProjectDeleteWarning

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

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
