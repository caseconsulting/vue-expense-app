<template>
  <PlaceOfBirth v-if="props.field.title === FIELDS.PLACE_OF_BIRTH.title" :field="props.field" :item="props.item" />
  <JobRole v-else-if="props.field.title === FIELDS.JOB_ROLE.title" :field="props.field" :item="props.item" />
  <Address v-else-if="props.field.title === FIELDS.ADDRESS.title" :field="props.field" :item="props.item" />
  <Social v-else-if="props.field.title === FIELDS.SOCIAL.title" :field="props.field" :item="props.item" />
  <Technologies
    v-else-if="props.field.title === FIELDS.TECHNOLOGIES.title"
    :field="props.field"
    :item="props.item"
    :valid="valid"
  />
  <div v-else>Edit functionality not implemented</div>
</template>

<script setup>
import PlaceOfBirth from '@/components/employees/power-edit/edit-items/custom-items/PlaceOfBirth.vue';
import JobRole from '@/components/employees/power-edit/edit-items/custom-items/JobRole.vue';
import Address from '@/components/employees/power-edit/edit-items/custom-items/Address.vue';
import Technologies from '@/components/employees/power-edit/edit-items/custom-items/Technologies.vue';
import Social from '@/components/employees/power-edit/edit-items/custom-items/Social.vue';
import FIELDS from '@/components/employees/power-edit/js/fields.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item', 'valid']);
</script>
