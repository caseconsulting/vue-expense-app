<template>
  <div class="infoTab">
    <p v-if="!isEmpty(this.model.prime)"><b>Prime:</b> {{ this.model.prime }}</p>
    <p v-if="!isEmpty(this.model.contract)"><b>Contract:</b> {{ this.model.contract }}</p>
    <p v-if="!isEmpty(this.model.jobRole)"><b>Job Role:</b> {{ this.model.jobRole }}</p>
    <p v-if="!isEmpty(this.model.github)">
      <b>Github: </b><a :href="'https://github.com/' + this.model.github" target="_blank"> {{ this.model.github }}</a>
    </p>
    <p v-if="!isEmpty(this.model.twitter)">
      <b>Twitter: </b
      ><a :href="'https://twitter.com/' + this.model.twitter" target="_blank"> {{ this.model.twitter }}</a>
    </p>
    <p v-if="!isEmpty(this.model.birthday) && (admin || employee)">
      <b>Birthday:</b> {{ this.model.birthday | monthDayYearFormat }}
    </p>
    <p v-else><b>Birthday:</b> {{ this.model.birthday | monthDayFormat }}</p>
    <p v-if="!isEmpty(this.model.birthdayFeed) && (admin || employee)">
      <b>Birthday on Feed:</b> {{ this.model.birthdayFeed | birthdayFeedResponse }}
    </p>
    <p v-if="!isEmpty(getPlaceOfBirth) && (admin || employee)"><b>Place of Birth:</b> {{ getPlaceOfBirth }}</p>
  </div>
</template>

<script>
import { isEmpty, monthDayFormat, monthDayYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns Employee's Place of Birth.
 *
 * @return String - place of birth.
 */
function getPlaceOfBirth() {
  if (!isEmpty(this.model.city) && !isEmpty(this.model.st) && !isEmpty(this.model.country)) {
    return `${this.model.city}, ${this.model.st}, ${this.model.country}`;
  } else if (!isEmpty(this.model.city) && !isEmpty(this.model.st)) {
    return `${this.model.city}, ${this.model.st}`;
  } else if (!isEmpty(this.model.city) && !isEmpty(this.model.country)) {
    return `${this.model.city}, ${this.model.country}`;
  } else if (!isEmpty(this.model.country)) {
    return `${this.model.country}`;
  } else {
    return '';
  }
} // getPlaceOfBirth

export default {
  computed: {
    getPlaceOfBirth
  },
  filters: {
    birthdayFeedResponse: (value) => {
      return value ? 'Yes' : 'No';
    },
    monthDayYearFormat,
    monthDayFormat
  },
  methods: {
    isEmpty
  },
  props: ['admin', 'employee', 'model']
};
</script>
