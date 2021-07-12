<template>
  <div class="infoTab">
    <p v-if="!isEmpty(this.model.github)">
      <b>Github: </b><a :href="'https://github.com/' + this.model.github" target="_blank"> {{ this.model.github }}</a>
    </p>
    <p v-if="!isEmpty(this.model.twitter)">
      <b>Twitter: </b
      ><a :href="'https://twitter.com/' + this.model.twitter" target="_blank"> {{ this.model.twitter }}</a>
    </p>
    <p v-if="!isEmpty(this.model.linkedIn)">
      <b>LinkedIn: </b><a :href="this.model.linkedIn" target="_blank"> {{ this.model.linkedIn }}</a>
    </p>
    <p v-if="!isEmpty(this.model.birthday) && (admin || employee)">
      <b>Birthday:</b> {{ this.model.birthday | monthDayYearFormat }}
    </p>
    <p v-else><b>Birthday:</b> {{ this.model.birthday | monthDayFormat }}</p>
    <p v-if="!isEmpty(this.model.birthdayFeed) && (admin || employee)">
      <b>Birthday on Feed:</b> {{ this.model.birthdayFeed | birthdayFeedResponse }}
    </p>
    <p v-if="!isEmpty(getPlaceOfBirth) && (admin || employee)"><b>Place of Birth:</b> {{ getPlaceOfBirth }}</p>
    <p v-if="!isEmpty(getCurrentAddress) && admin"><b>Current Address:</b> {{ getCurrentAddress }}</p>
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
 * Returns Employee's Current Address.
 *
 * @return String - current address.
 */
function getCurrentAddress() {
  let currentAddress = '';
  if (!isEmpty(this.model.currentStreet)) {
    currentAddress += `${this.model.currentStreet}, `;
  }
  if (!isEmpty(this.model.currentCity)) {
    currentAddress += `${this.model.currentCity}, `;
  }
  if (!isEmpty(this.model.currentState)) {
    currentAddress += `${this.model.currentState} `;
  }
  if (!isEmpty(this.model.currentZIP)) {
    currentAddress += `${this.model.currentZIP} `;
  }
  if (currentAddress[currentAddress.length - 2] === ',') {
    currentAddress = currentAddress.slice(0, -2);
  } else {
    currentAddress = currentAddress.slice(0, -1);
  }
  return currentAddress;
}

/**
 * Returns Employee's Place of Birth.
 *
 * @return String - place of birth.
 */
function getPlaceOfBirth() {
  let placeOfBirth = '';
  if (!isEmpty(this.model.city)) {
    placeOfBirth += `${this.model.city}, `;
  }
  if (!isEmpty(this.model.st)) {
    placeOfBirth += `${this.model.st}, `;
  }
  if (!isEmpty(this.model.country)) {
    placeOfBirth += `${this.model.country}, `;
  }

  placeOfBirth = placeOfBirth.slice(0, -2);
  return placeOfBirth;
} // getPlaceOfBirth

export default {
  computed: {
    getCurrentAddress,
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
