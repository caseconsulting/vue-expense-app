<template>
  <v-card id="base-card">
    <v-card-title class="d-flex align-center justify-space-between beta_header_style">
      <div class="d-flex align-center">
        <h3 class="text-white px-2">{{ title }}</h3>
        <slot name="infoIcon"></slot>
      </div>
      <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text" icon="" class="mx-1">
        <v-tooltip activator="parent" location="top"> Edit {{ title }} </v-tooltip>
        <v-icon id="edit" color="white"> mdi-pencil </v-icon>
      </v-btn>
    </v-card-title>
    <slot></slot>
  </v-card>
</template>

<script setup>
import { inject } from 'vue';

defineProps(['title']);
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');
</script>
