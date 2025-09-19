<template>
  <div>
    <strong>Details</strong>
    <v-row>
      <v-col>
        <v-text-field
          variant="underlined"
          v-model="modelValue.name"
          :rules="getRequiredRules()"
          label="Name"
          data-vv-name="Name"
          class="type_form_padding"
        ></v-text-field>
      </v-col>
    </v-row>
    <slot></slot>
  </div>
</template>
<script setup>
import { getRequiredRules } from '@/shared/validationUtils';

const props = defineProps({
  modelValue: Object
});
</script>