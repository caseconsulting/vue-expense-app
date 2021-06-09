<template>
  <div class="infoTab">
    <!-- Employee has entered languages-->
    <div v-if="!isEmpty(model.languages)">
      <!-- Loop Languages -->
      <div v-for="(languages, index) in model.languages" :key="languages.name">
        <v-row>
          <v-col>
            <p><b>Language: </b>{{ languages.name }}</p>
          </v-col>
        </v-row>
        <p><b>Level of Fluency: </b>{{ languages.proficiency }}</p>
        <hr v-if="index < model.languages.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Languages -->
    </div>
    <!-- Employee does not have Language Experience -->
    <p v-else>No Language Information</p>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';

export default {
  methods: {
    isEmpty
  },
  props: ['model']
};
</script>
