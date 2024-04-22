<template>
  <div class="d-flex align-center">
    <!-- GitHub-->
    <v-text-field v-model.trim="githubModel" autofocus label="GitHub (username)" variant="underlined" class="field">
      <template v-slot:prepend>
        <v-avatar rounded="0" size="20">
          <v-img class="grayImage" :src="github" alt="Github icon"></v-img>
        </v-avatar>
      </template>
    </v-text-field>
    <!-- X -->
    <v-text-field v-model.trim="xModel" label="X (username)" variant="underlined" class="field mx-6">
      <template v-slot:prepend>
        <v-avatar rounded="0" size="20">
          <v-img class="grayImage" :src="x" alt="X icon"></v-img>
        </v-avatar>
      </template>
    </v-text-field>
    <!-- LinkedIn-->
    <v-text-field
      v-model.trim="linkedInModel"
      :rules="getURLRules()"
      label="LinkedIn (profile URL)"
      variant="underlined"
      class="field"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0" size="20">
          <v-img class="grayImage" :src="linkedin" alt="Linkedin icon`"></v-img>
        </v-avatar>
      </template>
    </v-text-field>
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';
import { getURLRules } from '@/shared/validationUtils';
import github from '@/assets/img/trademarks/github.png';
import linkedin from '@/assets/img/trademarks/linkedin.png';
import x from '@/assets/img/trademarks/x.png';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');
const githubModel = ref(props.item['github']);
const xModel = ref(props.item['twitter']);
const linkedInModel = ref(props.item['linkedIn']);

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [githubModel.value, xModel.value, linkedInModel.value],
  () => {
    emitter.emit('update-item', {
      field: props.field,
      item: { ...props.item, github: githubModel.value, twitter: xModel.value, linkedIn: linkedInModel.value }
    });
  }
);
</script>

<style scoped>
.field {
  width: 250px !important;
  min-width: 250px !important;
  max-width: 250px !important;
}
.grayImage {
  -webkit-filter: brightness(0) opacity(55%);
  filter: brightness(0) opacity(55%);
}
</style>
