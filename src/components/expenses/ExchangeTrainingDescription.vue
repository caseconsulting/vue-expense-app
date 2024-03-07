<template>
  <div>
    <!-- Modal Card -->
    <v-card>
      <!-- Modal Title -->
      <v-card-title class="d-flex align-center header_style" @click="option = !option"
        >Exchange Training Hours Description</v-card-title
      >
      <!-- Modal Content -->
      <v-card-text class="mt-4">
        <p>
          Please provide details on how you will utilize your training, listing the specific courses, conferences, and
          topics you'll be learning during this training.
        </p>

        <div v-if="!option">
          <p class="mb-0 mt-3 font-weight-bold">How you will utilize:</p>
          <v-text-field label="Utilization..." variant="underlined" />

          <p class="mb-0 mt-3 font-weight-bold">List of specific courses or conferences:</p>
          <v-text-field label="Courses/Conferences..." variant="underlined" />

          <p class="mb-0 mt-3 font-weight-bold">Topics you will learn:</p>
          <v-text-field label="Topics..." variant="underlined" />
        </div>
        <div v-else>
          <!-- <v-textarea :rules="descriptionRules" v-model="desc" label="Description" /> -->

          <v-textarea
            variant="underlined"
            v-model="description"
            :rules="descriptionRules"
            id="description"
            class="mt-4"
            label="Description"
            data-vv-name="Description"
            validate-on="blur"
          ></v-textarea>
        </div>
      </v-card-text>
      <!-- Action Button -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-3" variant="text" @click.native="emitter.emit('close-exchange-training-desc')">
          Close
        </v-btn>
        <v-btn
          color="green "
          variant="text"
          :disabled="getCharsNeeded(description || '') > 0"
          @click.native="emitter.emit('insert-training-desc', description)"
        >
          Insert Description
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                    LIFECYCLE                     |
// |                                                  |
// |--------------------------------------------------|

function mounted() {
  this.description = this.previousDesc;
}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns difference of text length and minimum chars needed for
 * description.
 *
 * @input text the text to evaluate
 */
function getCharsNeeded(text) {
  return this.CHAR_MINIMUM - text.replace(/\s/g, '').length;
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      option: true,
      description: '',
      CHAR_MINIMUM: 150,
      descriptionRules: [
        (v) => !_.isEmpty(v) || 'Description is a required field',
        (v) =>
          (!_.isEmpty(v) && this.getCharsNeeded(v) <= 0) ||
          `Description needs ${this.getCharsNeeded(v)} more character${this.getCharsNeeded(v) == 1 ? '' : 's'}.`
      ]
    };
  },
  props: ['previousDesc'],
  methods: {
    getCharsNeeded
  },
  mounted
};
</script>
