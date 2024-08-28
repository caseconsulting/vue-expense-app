<template>
  <v-col>
    <v-row>
      <v-textarea
        v-model="misc"
        variant="outlined"
        label="Miscellaneous"
        auto-grow
        rows="5"
        max-rows="8"
        class="w-100"
      ></v-textarea>
    </v-row>
    <v-row>
      <v-col>
        <v-row v-for="hf in highFives" :key="hf.desc" class="mb-2">
          <p>
            <v-icon icon="mdi-hands-pray" class="mr-2"></v-icon>
            <span class="cursor-default">High Five from {{ hf.from }}</span>
            <v-icon icon="mdi-text-box-outline" class="ml-2">
              <v-tooltip activator="parent" location="top" max-width="600">{{ hf.desc }}</v-tooltip>
            </v-icon>
          </p>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['notes', 'user']);

let highFives = [
  {
    from: 'Chad Martin',
    desc: 'Congrats on the thing :)',
    date: '01/01/2024'
  },
  {
    from: 'Alissa Bendele',
    desc: 'Good job on the Demo!',
    date: '01/04/2024'
  },
  {
    from: 'Amy Farmer',
    desc: 'This is a longer text to see what it looks like when you type a lot. There is some things over here too, and the fact that it is really long is not a coincidence because you did such a great job on the thing. Wowie such a good job. Congrats on doing a good job and keep up the good job with the thing!',
    date: '04/29/2024'
  }
];
let awards = [
  {
    title: 'Best Product',
    desc: 'Chad Martin',
    date: '01/01/2024'
  },
  {
    title: 'Most Valuable Customer',
    desc: 'Alissa Bendele',
    date: '01/04/2024'
  }
];

var misc = ref('');
</script>
