<template>
  <div>
    <!-- Modal Card -->
    <v-card>
      <!-- Modal Title -->
      <v-card-title class="d-flex align-center header_style">Exchange For Training Hours Description</v-card-title>
      <!-- Modal Content -->
      <v-card-text class="mt-4 px-6 pb-0">
        <p class="font-body-1">
          Please provide details on how you will utilize your training, listing the specific courses, conferences, and
          topics you'll be learning during this training. Your description must be at least 150 characters.
        </p>

        <div>
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
          <p class="text-right mt-0">
            <span :class="`${charCountClass}`">{{ charCount }}</span> / {{ CHAR_MINIMUM }}
          </p>
        </div>
      </v-card-text>
      <!-- Action Button -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-3" variant="text" @click="emitter.emit('close-exchange-training-desc')">
          Close
        </v-btn>
        <v-btn
          color="green "
          variant="text"
          :disabled="!charMinMet"
          @click="emitter.emit('insert-training-desc', description)"
        >
          Insert Description
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import _isEmpty from 'lodash/isEmpty';

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
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

function charCount() {
  return this.description?.replace(/\s/g, '').length || 0;
}

function charMinMet() {
  return this.charCount >= this.CHAR_MINIMUM;
}

function charCountClass() {
  let goodClasses = ['text-green', 'font-weight-black'];
  let badClasses = ['text-red'];
  return this.charMinMet ? goodClasses.join(' ') : badClasses.join(' ');
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      description: '',
      CHAR_MINIMUM: 150,
      descriptionRules: [
        (v) => !_isEmpty(v) || 'Description is required',
        (v) => (!_isEmpty(v) && this.charMinMet) || `Description needs at least ${this.CHAR_MINIMUM} characters.`
      ]
    };
  },
  props: ['previousDesc'],
  computed: {
    charCount,
    charMinMet,
    charCountClass
  },
  mounted
};
</script>
