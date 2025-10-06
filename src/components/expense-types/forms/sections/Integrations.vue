<template>
  <div>
    <v-row>
      <v-col cols="12">
        <strong>Integrations</strong>
      </v-col>
    </v-row>
    <v-autocomplete
      variant="underlined"
      :items="campfires"
      v-model="modelValue.campfire"
      item-title="name"
      item-value="url"
      label="Basecamp Campfire (optional)"
      clearable
    ></v-autocomplete>
  </div>
</template>
<script setup>
import { updateStoreCampfires } from '@/utils/storeUtils';
import { onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  modelValue: Object
});
const store = useStore();

const campfires = ref([]); // basecamp campfires

/**
 * Gets and sets all employees.
 */
onBeforeMount(async () => {
  await updateStoreCampfires();
  campfires.value = store.getters.basecampCampfires;
});
</script>
