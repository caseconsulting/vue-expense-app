<template>
  <div>
    <v-row>
      <v-col cols="12">
        <strong>Flags</strong>
        <help type="expenseTypes"></help>
      </v-col>
      <slot></slot>
      <v-col cols="auto">
        <checkbox
          label="Show On Feed"
          v-model="modelValue.showOnFeed"
        ></checkbox>
        </v-col>
      <v-col cols="auto">
        <checkbox
          label="URL Required"
          v-model="modelValue.requireURL"
        ></checkbox>
        </v-col>
      <v-col cols="auto">
        <checkbox
          label="Receipt Required"
          v-model="modelValue.requireReceipt"
        ></checkbox>
      </v-col>
    </v-row>
  </div>
</template>
<script setup>
import Checkbox from '@/components/shared/edit-fields/Checkbox.vue';
import Help from '@/components/shared/buttons/Help.vue';

const props = defineProps({
  modelValue: Object
});
</script>