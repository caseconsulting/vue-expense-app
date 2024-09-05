<template>
  <base-card title="Personal Information">
    <template #title>
      <div class="d-flex align-center">
        <v-icon size="small" style="margin-right: 10px" id="personal" color="white"> mdi-account </v-icon>
        <h3 class="text-white">Personal Info</h3>
      </div>
    </template>
    <v-card-text class="px-7 pt-7 pb-1 text-black">
      <!-- full name -->
      <v-row dense>
        <v-col>
          <p class="mb-1">
            <b>Full Name: </b
            >{{ model.firstName + ' ' + (!model.noMiddleName ? model.middleName + ' ' : '') + model.lastName }}
          </p>
        </v-col>
      </v-row>

      <!-- phone numbers -->
      <v-col dense v-if="!isEmpty(getPhoneNumbers())">
        <v-row class="pr-0 pb-1">
          <b class="d-inline-flex">Phone Numbers:</b>
        </v-row>
        <v-row class="pb-1" v-for="phone in getPhoneNumbers()" :key="phone">
          <v-col class="pa-0">
            <p class="d-inline pa-0" v-if="!phone.private || isAdmin || isUser">
              {{ phone.number }}
            </p>
          </v-col>
          <v-col cols="auto" class="pa-0">
            <div class="d-inline float-right">
              <v-icon v-if="!phone.private">mdi-shield-outline</v-icon>
              <v-icon v-else>mdi-shield</v-icon>
              <v-tooltip activator="parent" location="top">{{
                phone.private ? 'Hidden from other employees' : 'Visible to other employees'
              }}</v-tooltip>
            </div>
          </v-col>
        </v-row>
      </v-col>

      <!-- birthday -->
      <v-row dense v-if="!isEmpty(getBirthday()) && (isAdmin || isUser)">
        <v-col class="d-inline-flex">
          <p class="mb-1"><b>Birthday: </b> {{ getBirthday() }}</p>
        </v-col>
        <v-col class="d-inline float-right" cols="auto">
          <v-icon v-if="!model.birthdayFeed">mdi-shield</v-icon>
          <v-icon v-else>mdi-shield-outline</v-icon>
          <v-tooltip activator="parent" location="top">{{
            !model.birthdayFeed ? 'Hidden from other employees' : 'Visible to other employees'
          }}</v-tooltip>
        </v-col>
      </v-row>

      <!-- current address -->
      <v-col dense v-if="!isEmpty(getCurrentAddress() && (isAdmin || isUser))">
        <v-row no-gutter cols="auto">
          <b>Address:</b>
        </v-row>
        <v-row class="py-1">
          <v-col class="pa-0">
            <p class="d-inline text-wrap">
              {{ getCurrentAddress() }}
            </p>
          </v-col>
          <v-col class="pa-0" cols="1">
            <div class="float-right">
              <v-icon>mdi-shield</v-icon>
              <v-tooltip activator="parent" location="top">Always hidden from other employees</v-tooltip>
            </div>
          </v-col>
        </v-row>
      </v-col>

      <!-- place of birth -->
      <v-col dense v-if="!isEmpty(getPlaceOfBirth() && (isAdmin || isUser))">
        <v-row>
          <b class="pr-1">Place of Birth: </b>
        </v-row>
        <v-row>
          <v-col class="pa-0 d-inline"> {{ getPlaceOfBirth() }} </v-col>
          <v-col class="pa-0" cols="1">
            <div class="float-right">
              <v-icon>mdi-shield</v-icon>
              <v-tooltip activator="parent" location="top">Always hidden from other employees</v-tooltip>
            </div>
          </v-col>
        </v-row>
      </v-col>
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
  let address = [];
  let toAdd = ['currentStreet', 'currentStreet2', 'currentCity', 'currentState', 'currentZIP'];
  for (let item of toAdd) if (!isEmpty(props.model[item])) address.push(props.model[item]);
  return address.join(', ');
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

<style scoped>
.current-address {
  min-width: 100% - 21px;
}
</style>
