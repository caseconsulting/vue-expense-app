<template>
  <div>
    <details-form :model="model"></details-form>
    <flags :model="model"></flags>
  </div>
</template>
<script setup>
import DetailsForm from '@/components/expense-types/forms/Details.vue';
import Flags from '@/components/expense-types/forms/Flags.vue';

const props = defineProps({
  model: Object
});
</script>