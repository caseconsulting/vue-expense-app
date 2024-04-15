<template>
  <PlaceOfBirth v-if="props.field.title === FIELDS.PLACE_OF_BIRTH.title" :field="props.field" :item="props.item" />
  <JobRole v-else-if="props.field.title === FIELDS.JOB_ROLE.title" :field="props.field" :item="props.item" />
  <div v-else>Edit functionality not implemented</div>
</template>

<script setup>
import PlaceOfBirth from '@/components/employees/power-edit/edit-items/custom-items/PlaceOfBirth.vue';
import JobRole from '@/components/employees/power-edit/edit-items/custom-items/JobRole.vue';
const FIELDS = require('@/components/employees/power-edit/js/fields.js');

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
</script>
