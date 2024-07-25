<template>
  <v-card id="base-card" class="ma-1">
    <v-card-title class="beta_header_style px-0 d-flex align-center">
      <v-container class="d-flex flex-nowrap justify-space-between">
        <!-- title -->
        <v-row no-gutters class="fit-content align-center">
          <v-col>
            <!-- Custom Title Slot  -->
            <slot name="title">
              <h3 class="text-white">{{ title }}</h3>
            </slot>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
        <!-- action buttons -->
        <v-row no-gutters class="fit-content d-flex align-center justify-end">
          <v-col>
            <slot name="actions"></slot>
          </v-col>
          <v-col class="ml-2">
            <v-btn v-if="isAdmin || isUser" @click="toggleEdit()" density="comfortable" variant="text" icon="">
              <v-tooltip activator="parent" location="top"> Edit {{ title }} </v-tooltip>
              <v-icon id="edit" color="white"> mdi-pencil </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card-title>
    <v-card-text :class="smAndDown ? 'pa-0' : ''">
      <!-- Default Slot -->
      <slot></slot>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { inject } from 'vue';
import { useDisplay } from 'vuetify';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const { smAndDown } = useDisplay();
const emitter = inject('emitter');

const props = defineProps({
  title: {
    type: String,
    required: true
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
  if (props.title === 'Personal Information' || props.title === 'Employee' || props.title === 'Other Information') {
    emitter.emit('editing', 'Personal Information');
  } else if (props.title === 'Clearance') {
    emitter.emit('editing', 'Clearance');
  } else if (props.title === 'Contracts') {
    emitter.emit('editing', 'Contracts');
  } else if (props.title === 'Past Experience') {
    emitter.emit('editing', 'Past Experience');
  } else if (props.title === 'Certifications' || props.title === 'Awards') {
    emitter.emit('editing', 'Certifications + Awards');
  } else if (props.title === 'Education') {
    emitter.emit('editing', 'Education');
  } else if (props.title === 'Technologies and Skills' || props.title === 'Foreign Languages') {
    emitter.emit('editing', 'Tech, Skills, and Languages');
  } else {
    emitter.emit('Personal Information');
  }
}
</script>
