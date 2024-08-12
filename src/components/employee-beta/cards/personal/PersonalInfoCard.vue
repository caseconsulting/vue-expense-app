<template>
  <base-card title="Personal Information">
    <template #title>
      <div class="d-flex align-center">
        <v-icon size="small" style="margin-right: 10px" id="personal" color="white"> mdi-account </v-icon>
        <h3 class="text-white">Personal Info</h3>
      </div>
    </template>
    <v-card-text class="px-7 pt-7 pb-1 text-black">
      <p>
        <b>Full Name: </b
        >{{ model.firstName + ' ' + (!model.noMiddleName ? model.middleName + ' ' : '') + model.lastName }}
      </p>
      <v-row v-if="!isEmpty(getPhoneNumbers())">
        <v-col class="pr-0" cols="auto">
          <b class="d-inline-flex">Phone Numbers:</b>
        </v-col>
        <v-col>
          <div class="d-flex flex-row" v-for="phone in getPhoneNumbers()" :key="phone">
            <p class="d-inline-flex pa-0" v-if="!phone.private || isAdmin || isUser">
              {{ phone.number }}
            </p>
            <v-spacer></v-spacer>
            <div class="d-inline-flex float-right">
              <v-icon v-if="!phone.private">mdi-shield-outline</v-icon>
              <v-icon v-else>mdi-shield</v-icon>
              <v-tooltip activator="parent" location="top">{{
                phone.private ? 'Hidden from other employees' : 'Visible to other employees'
              }}</v-tooltip>
            </div>
          </div>
        </v-col>
      </v-row>
      <div>
        <p class="d-inline-flex" v-if="!isEmpty(getBirthday()) && (isAdmin || isUser)">
          <b class="pr-1">Birthday: </b> {{ getBirthday() }}
        </p>
        <div class="d-inline float-right">
          <v-icon v-if="!model.birthdayFeed">mdi-shield</v-icon>
          <v-icon v-else>mdi-shield-outline</v-icon>
          <v-tooltip activator="parent" location="top">{{
            !model.birthdayFeed ? 'Hidden from other employees' : 'Visible to other employees'
          }}</v-tooltip>
        </div>
      </div>
      <div class="d-flex flex-row" v-if="!isEmpty(getCurrentAddress() && (isAdmin || isUser))">
        <p class="d-inline-flex pr-1"><b>Address:</b></p>
        <p class="d-inline-flex">
          {{ getCurrentAddress() }}
        </p>
        <v-spacer></v-spacer>
        <div class="d-inline">
          <v-icon>mdi-shield</v-icon>
          <v-tooltip activator="parent" location="top">Always hidden from other employees</v-tooltip>
        </div>
      </div>
      <v-row dense v-if="!isEmpty(getPlaceOfBirth() && (isAdmin || isUser))">
        <v-col cols="auto">
          <p class="d-inline text-align: float-left">
            <b>Place of Birth: </b>
          </p>
        </v-col>
        <v-col>
          <p class="d-inline">{{ getPlaceOfBirth() }}</p>
        </v-col>
        <v-col cols="auto">
          <div class="d-inline-flex float-right">
            <v-icon>mdi-shield</v-icon>
            <v-tooltip activator="parent" location="top">Always hidden from other employees</v-tooltip>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </base-card>
</template>

<script setup>
import { inject } from 'vue';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';
import BaseCard from '../BaseCard.vue';

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
function getPhoneNumbers() {
  if (!isEmpty(props.model.publicPhoneNumbers) && !isEmpty(props.model.privatePhoneNumbers)) {
    return props.model.publicPhoneNumbers.concat(props.model.privatePhoneNumbers);
  } else if (!isEmpty(props.model.publicPhoneNumbers)) {
    return props.model.publicPhoneNumbers;
  } else if (!isEmpty(props.model.privatePhoneNumbers)) {
    return props.model.privatePhoneNumbers;
  } else {
    return [];
  }
} // getPhoneNumbers
</script>
