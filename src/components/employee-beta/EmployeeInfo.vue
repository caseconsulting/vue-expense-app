<template>
  <v-sheet>
    <v-row class="ma-5">
      <v-col>
        <v-avatar :color="color || caseRed" :size="96">
          <span style="position: absolute">{{ initials }}</span>
          <v-img style="position: absolute" :src="avatar" :alt="`${employeeName}'s Avatar'`" />
        </v-avatar>
      </v-col>
      <v-col>
        <v-row align-content="center">
          <v-col cols="12"><h3>Employee Name</h3></v-col>
          <v-col>email@someplace.com</v-col>
          <v-col>
            <v-img></v-img>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps({
  model: {
    type: Object,
    required: true
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const employeeName = computed(() => {
  if (!props.model) return 'unknown employee';
  return `${props.model.nickname || props.model.firstName} ${props.model.lastName}`;
});

const initials = computed(() => {
  if (!props.model) return '';
  return (
    (props.model.nickname || props.model.firstName).charAt(0).toUpperCase() +
    props.model.lastName.charAt(0).toUpperCase()
  );
});

const avatar = computed(() => {
  if (props.model) return props.model.avatar;
  return null;
});
</script>
