<template>
  <v-avatar :color="color || caseRed" :size="size">
    <span style="position: absolute">{{ initials }}</span>
    <v-img style="position: absolute" :src="image" :alt="alt || `User avatar for ${empName}`" />
  </v-avatar>
</template>

<script setup>
import { computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps({
  employee: {
    type: Object,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: undefined
  },
  size: {
    type: [String, Number],
    default: '40'
  },
  alt: {
    type: String,
    default: undefined
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns the employee name
 */

const empName = computed(() => {
  if (!props.employee) return 'a CASE employee';
  return `${props.employee.nickname || props.employee.firstName} ${props.employee.lastName}`;
}); // empName

/**
 * Returns just the initials employee
 */
const initials = computed(() => {
  if (!props.employee) return '';
  return (
    (props.employee.nickname || props.employee.firstName).charAt(0).toUpperCase() +
    props.employee.lastName.charAt(0).toUpperCase()
  );
}); // initials
</script>
