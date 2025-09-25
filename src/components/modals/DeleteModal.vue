<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="text-h5">Delete item</v-card-title>
        <v-card-text> Are you sure you want to delete this {{ type }}? {{ deleteInfo }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            variant="text"
            @click="
              emitter.emit(`canceled-delete-${type}`);
              activate = false;
            "
          >
            No, keep {{ type }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="green-darken-1" id="confirmDelete" variant="text" @click="confirmDelete()"> Delete </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps([
  'toggleDeleteModal', // dialog activator
  'type', // type of object being deleted
  'deleteInfo', //delete info to be displayed
  'deleteMethod'
]);

const activate = ref(false); // dialog activator

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function confirmDelete() {
  if (props.deleteMethod) {
    props.deleteMethod();
  } else {
    emitter.emit(`confirm-delete-${type}`);
  }
  activate.value = false;
}

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

// Watcher for toggleDeleteModal
watch(
  () => props.toggleDeleteModal,
  () => {
    activate.value = props.toggleDeleteModal;
  }
);
</script>
