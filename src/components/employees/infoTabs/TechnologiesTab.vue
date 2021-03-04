<template>
  <div class="infoTab">
    <!-- Employee has Technology Experience -->
    <div v-if="!isEmpty(model.technologies)">
      <!-- Loop Technologies -->
      <div v-for="(technology, index) in model.technologies" :key="technology.name">
        <p><b>Technology: </b>{{ technology.name }}</p>
        <p><b>Years of Experience: </b>{{ yearsOfExperience(technology) }}</p>
        <p><b>Current: </b>{{ technology.current | current }}</p>
        <hr v-if="index < model.technologies.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Technologies -->
    </div>
    <!-- Employee does not have Technology Experience -->
    <p v-else>No Technology Information</p>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calculates years of experience for a technology based on monthsOfExperience.
 *
 * @param technology - technology object
 * @return years of expierence (decimal with 2 decimal places)
 */
function yearsOfExperience(technology) {
  if (technology.monthsOfExperience) {
    let years = technology.monthsOfExperience / 12; //calculates years of experience
    return Math.round((years + Number.EPSILON) * 100) / 100; //rounds to 2 decimal places
  }
  return technology.years ? technology.years : 0; //if uses old technology.years then use that or set to 0
} // yearsOfExperience

export default {
  filters: {
    current: (value) => {
      return value ? 'Yes' : 'No';
    }
  },
  methods: {
    isEmpty,
    yearsOfExperience
  },
  props: ['model']
};
</script>
