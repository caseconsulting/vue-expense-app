<template>
  <v-card id="base-card">
    <v-card-title class="beta_header_style px-0 d-flex align-center">
      <v-container class="fit-content d-flex flex-nowrap justify-start">
        <!-- title -->
        <v-row no-gutters class="fit-content align-center">
          <v-col v-if="$slots.prependIcon" class="mr-2">
            <slot name="prependIcon"></slot>
          </v-col>
          <v-col>
            <slot name="title">
              <h3 class="text-white">{{ title }}</h3>
            </slot>
          </v-col>
        </v-row>
        <v-spacer class="flex-grow-1"></v-spacer>
        <!-- action buttons -->
        <v-row no-gutters class="fit-content d-flex align-center justify-end">
          <v-col>
            <slot name="actions"></slot>
          </v-col>
          <v-col class="ml-2">
            <v-btn
              v-if="(isAdmin || isUser) && !noEdit"
              @click="toggleEdit()"
              density="comfortable"
              variant="text"
              icon=""
            >
              <v-tooltip activator="parent" location="top"> Edit {{ title }} </v-tooltip>
              <v-icon id="edit" color="white"> mdi-pencil </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-card-text>
      <slot></slot>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { inject } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  noEdit: {
    type: Boolean,
    default: false
  }
});
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function toggleEdit() {
  emitter.emit('editing', props.title);
}
</script>
