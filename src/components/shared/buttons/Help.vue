<template>
  <v-avatar @click="toFAQ()" class="mb-4" size="small">
    <v-tooltip activator="parent" location="top">Click for FAQ</v-tooltip>
    <v-icon icon="mdi-information" color="#3f51b5" size="small" />
  </v-avatar>
  
</template>
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  type: {
    type: String,
    default: ''
  }
});

/**
 * route to FAQ
 */
function toFAQ() {
  let faq = router.resolve({ path: `/help/${props.type}` });
  window.open(faq.href, '_blank');
} // toFAQ
</script>