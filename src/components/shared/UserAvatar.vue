<template>
  <v-avatar :color="color || caseRed" :size="size">
    <span style="position: absolute">{{ initials }}</span>
    <v-img style="position: absolute" :src="image" :alt="alt || `User avatar for ${empName}`" />
  </v-avatar>
</template>

<script>
/**
 * Returns the employee name
 */
function empName() {
  if (!this.employee) return 'a CASE employee';
  return `${this.employee.nickname || this.employee.firstName} ${this.employee.lastName}`;
} // empName

/**
 * Returns just the initials employee
 */
function initials() {
  if (!this.employee) return '';
  return (
    (this.employee.nickname || this.employee.firstName).charAt(0).toUpperCase() +
    this.employee.lastName.charAt(0).toUpperCase()
  );
} // initials

export default {
  computed: {
    empName,
    initials
  },
  props: {
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
  }
};
</script>
