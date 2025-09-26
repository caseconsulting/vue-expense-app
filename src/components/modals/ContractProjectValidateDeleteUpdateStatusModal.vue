<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="450">
      <v-card>
        <!-- Errors across tabs -->
        <v-card-text class="font-weight-medium text-h6">{{ title }}</v-card-text>
        <v-card-text>
          <span>{{ message }}</span>
          <br />
          <br />
          <div v-for="r in relationships" :key="r.project.id">
            <span
              ><b>Contract:</b> {{ r.contract }}, <b>Prime:</b> {{ r.prime }}, <b>Project:</b>
              {{ r.project.projectName }}</span
            >
            <ul class="ml-6">
              <li v-for="e in r.employees" :key="e.id">
                <router-link :to="`/employee/${e.employeeNumber}`" class="link"> {{ `${e.firstName} ${e.lastName}` }} </router-link>
              </li>
            </ul>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="
              activate = false;
              emit('contract-project-validate-error-acknowledged');
            "
          >
            Ok
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions> </v-card
    ></v-dialog>
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['title', 'message', 'toggleModal', 'relationships']);
const emitter = inject('emitter');

const activate = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

// Watcher for modal toggle
watch(
  () => props.toggleModal,
  () => {
    activate.value = props.toggleModal;
  }
);

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
  emitter.emit(msg);
} // emit
</script>

<style scoped>
.link{
  text-decoration: none;
  cursor: pointer;
  color: blue;
}
</style>
