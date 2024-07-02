<template>
  <v-dialog v-model="dialog" max-height="500" max-width="900">
    <template v-slot:default>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between beta_header_style">
          <h3>All Education</h3>
          <div>
            <v-btn v-if="isAdmin || isUser" @click="toggleEdit()" density="comfortable" variant="text" icon="">
              <v-tooltip activator="parent" location="top"> Edit Education </v-tooltip>
              <v-icon id="edit" color="white"> mdi-pencil </v-icon>
            </v-btn>
            <v-btn @click="dialog = false" variant="text" icon="">
              <v-tooltip activator="parent" location="top"> Collapse </v-tooltip>
              <v-icon id="collapse" color="white">mdi-arrow-collapse</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <education-list :list="totalList"></education-list>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import { isEmpty } from '@/utils/utils';
import EducationList from '../lists/EducationList.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const dialog = defineModel();

const emitter = inject('emitter');
const totalList = ref([]);
const isUser = inject('isUser');
const isAdmin = inject('isAdmin');

// |--------------------------------------------------|
// |                                                  |
// |                LIFESTYLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
onBeforeMount(() => {
  if (!isEmpty(props.model.education)) {
    totalList.value = props.model.education; // gets all education
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function toggleEdit() {
  dialog.value = false;
  emitter.emit('editing', 'Education');
}
</script>
