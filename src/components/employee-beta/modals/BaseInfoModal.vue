<template>
  <v-dialog v-model="toggleModal" max-width="650">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between header_style">
        <h3 class="text-white px-2">{{ title }}</h3>
        <div>
          <!-- Edit Button -->
          <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text" icon="">
            <v-tooltip activator="parent" location="top"> Edit Profile </v-tooltip>
            <v-icon id="edit" color="white"> mdi-pencil </v-icon>
          </v-btn>
          <!-- Collapse -->
          <v-btn @click="toggleModal = false" variant="text" icon="">
            <v-tooltip activator="parent" location="top"> Collapse </v-tooltip>
            <v-icon id="collapse" color="white">mdi-arrow-collapse</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <slot></slot>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { inject } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

defineProps(['title']);
const toggleModal = defineModel();

const isAdmin = inject('isAdmin');
const isUser = inject('isUser');
</script>
