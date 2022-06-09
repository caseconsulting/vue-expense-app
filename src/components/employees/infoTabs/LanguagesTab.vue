<template>
  <div class="infoTab">
    <!-- Employee has entered languages-->
    <div v-if="!isEmpty(model.languages)">
      <!-- Loop Languages -->
      <div v-for="(languages, index) in this.filteredList" :key="languages.name + index">
        <v-row>
          <v-col>
            <p><b>Language: </b>{{ languages.name }}</p>
          </v-col>
        </v-row>
        <p><b>Level of Fluency: </b>{{ languages.proficiency }}</p>
        <hr v-if="index < filteredList.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Languages -->
    </div>
    <!-- Employee does not have Language Experience -->
    <p v-else>No Foreign Language Information</p>
    <!-- Pagination -->
    <div v-if="!isEmpty(this.model.languages) && Math.ceil(model.languages.length / 5) != 1" class="text-center">
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.languages.length / 5)"
        :total-visible="8"
        @input="onPageChange"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!this.isEmpty(this.model.languages)) {
    this.filteredList = this.model.languages.slice(0, 5);
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * When the page is changed, grab the corresponding entries based on the page
 * number.
 */
function onPageChange() {
  var startIndex = 5 * (this.page - 1); //each page contains 5 Language entries
  var endIndex = startIndex + 5;
  this.filteredList = this.model.languages.slice(startIndex, endIndex);
} // onPageChange

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      filteredList: [],
      page: 1
    };
  },
  methods: {
    isEmpty,
    onPageChange
  },
  props: ['model']
};
</script>
