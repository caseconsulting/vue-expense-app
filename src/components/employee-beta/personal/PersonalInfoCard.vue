<template>
  <v-card class="infoTab">
    <v-card-title class="d-flex align-center justify-space-between beta_header_style">
      <h3 class="text-white px-2">
        <v-icon size="small" style="margin-right: 10px" id="personal" color="white"> mdi-account </v-icon> Personal
        Information
      </h3>
      <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text">
        <v-tooltip activator="parent" location="top"> Edit Profile </v-tooltip>
        <v-icon id="edit" color="white"> mdi-pencil </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="px-7 pt-7 pb-1 text-black">
      <p v-if="!isEmpty(getPhoneNumber())">
        <b>Phone Number: </b>{{ getPhoneNumber() }}<v-icon class="text-align: float-right">mdi-shield-outline</v-icon>
      </p>

      <p v-if="!isEmpty(getBirthday()) && props.model.birthdayFeed && (isAdmin || isUser)">
        <b>Birthday: </b>{{ getBirthday() }}
        <v-icon class="text-align: float-right" v-if="!props.model.birthdayFeed">mdi-shield</v-icon>
        <v-icon class="text-align: float-right" v-else>mdi-shield-outline</v-icon>
      </p>
      <div style="display: flex">
        <p style="width: 65px"><b>Address:</b></p>
        <p style="width: 200px" v-if="!isEmpty(getCurrentAddress() && (isAdmin || isUser))">
          {{ getCurrentAddress() }}
        </p>
        <v-icon style="margin-left: auto; margin-right: 0">mdi-shield</v-icon>
      </div>
      <p v-if="!isEmpty(getPlaceOfBirth() && (isAdmin || isUser))">
        <b>Place of Birth: </b> {{ getPlaceOfBirth() }}<v-icon class="text-align: float-right">mdi-shield</v-icon>
      </p>
    </v-card-text>
    <p
      v-if="
        isEmpty(getPhoneNumber()) &&
        (isEmpty(getBirthday()) || !props.model.birthdayFeed) &&
        isEmpty(getCurrentAddress()) &&
        isEmpty(getPlaceOfBirth())
      "
      style="text-align: center"
    >
      No Personal Information
    </p>
  </v-card>
</template>

<script setup>
import { inject } from 'vue';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns Employee's birthday
 *
 * @return String - Employee's birthday in (Month Day, Year) format
 */
function getBirthday() {
  return monthDayYearFormat(props.model.birthday);
}

/**
 * Returns Employee's Place of Birth.
 *
 * @return String - place of birth.
 */
function getPlaceOfBirth() {
  let placeOfBirth = '';
  if (!isEmpty(props.model.city)) {
    placeOfBirth += `${props.model.city}, `;
  }

  if (!isEmpty(props.model.country)) {
    placeOfBirth += `${props.model.country}, `;
  }

  placeOfBirth = placeOfBirth.slice(0, -2);
  return placeOfBirth;
} // getPlaceOfBirth

/**
 * Returns Employee's Current Address.
 *
 * @return String - Current Address.
 */
function getCurrentAddress() {
  let address = '';
  if (!isEmpty(props.model.currentStreet)) {
    address += `${props.model.currentStreet}, `;
  }
  if (!isEmpty(props.model.currentCity)) {
    address += `${props.model.currentCity}, `;
  }
  if (!isEmpty(props.model.currentState)) {
    address += `${props.model.currentState} `;
  }
  if (!isEmpty(props.model.currentZIP)) {
    address += `${props.model.currentZIP}, `;
  }

  address = address.slice(0, -2);
  return address;
} // getCurrentAddress

/**
 * Returns the first non-privated phone number
 *
 * @return String - phone number
 */
function getPhoneNumber() {
  let phoneNumbers = [];
  let displayedNumber = null;
  if (!isEmpty(props.model.publicPhoneNumbers)) {
    props.model.publicPhoneNumbers.forEach((publicNumber) => {
      phoneNumbers.push(publicNumber);
    });
  }
  if (phoneNumbers.length > 0) {
    displayedNumber = phoneNumbers[0].number;
  }
  return displayedNumber;
} // getPhoneNumber
</script>
