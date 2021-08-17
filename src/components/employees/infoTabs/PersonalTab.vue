<template>
  <div v-if="childrenVisible" class="infoTab" id="personalTab">
    <!-- GitHub -->
    <p v-if="!isEmpty(this.model.github)">
      <b>Github: </b><a :href="'https://github.com/' + this.model.github" target="_blank"> {{ this.model.github }}</a>
    </p>
    <!-- Twitter -->
    <p v-if="!isEmpty(this.model.twitter)">
      <b>Twitter: </b
      ><a :href="'https://twitter.com/' + this.model.twitter" target="_blank"> {{ this.model.twitter }}</a>
    </p>
    <!-- LinkedIn -->
    <p v-if="!isEmpty(this.model.linkedIn)">
      <b>LinkedIn: </b><a :href="this.model.linkedIn" target="_blank"> {{ this.model.linkedIn }}</a>
    </p>
    <!-- Phone Number -->
    <p v-if="!isEmpty(this.model.phoneNumber) && (userIsAdmin() || userIsEmployee() || userIsManager())">
      <b>Phone Number:</b> {{ this.model.phoneNumber }}
    </p>
    <!-- Birthday -->
    <p v-if="!isEmpty(this.model.birthday) && (admin || employee)">
      <b>Birthday:</b> {{ monthDayYearFormat(this.model.birthday) }}
    </p>
    <!-- Birthday Feed -->
    <p v-if="!isEmpty(this.model.birthdayFeed) && (admin || employee)">
      <b>Birthday on Feed:</b> {{ this.model.birthdayFeed | birthdayFeedResponse }}
    </p>
    <!-- Place of Birth -->
    <p v-if="!isEmpty(getPlaceOfBirth) && (admin || employee)"><b>Place of Birth:</b> {{ getPlaceOfBirth }}</p>
    <!-- Current Address -->
    <p v-if="!isEmpty(getCurrentAddress) && (userIsAdmin() || userIsEmployee())">
      <b>Current Address:</b> {{ getCurrentAddress }}
    </p>
  </div>
  <p v-else>No Personal Information</p>
</template>

<script>
import { isEmpty, monthDayYearFormat } from '@/utils/utils';
import { getRole } from '@/utils/auth';
import api from '@/shared/api.js';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  let user = await api.getUser();
  this.userId = user.employeeNumber;
  this.checkEmptyPersonalInfo();
} //created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks the body of the personal tab and if it does not contain any fields/info, text will be shown there is no info.
 */
function checkEmptyPersonalInfo() {
  let nodeArr = [];
  // convert to array because childNodes is an object that cannot use .every()
  document.querySelector('#personalTab').childNodes.forEach((node) => {
    nodeArr.push(node);
  });
  // there are visible elements if not every child node is a comment
  this.childrenVisible = !nodeArr.every((node) => node.nodeType === Node.COMMENT_NODE);
} // checkEmptyPersonalInfo

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
} // getCurrentAddress

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

/**
 * Checks whether the current user role is admin, used specifically
 * to prevent the manager from changing their own role on the Employee tab
 * @return - boolean: true if the user role is admin
 */
function userIsAdmin() {
  return getRole() === 'admin';
} //userIsAdmin

/**
 * Checks if the profile accessed is the signed-in user's profile
 *
 * @returns boolean - true if the profile is the user's profile
 */
function userIsEmployee() {
  if (this.$route.params.id == this.userId) {
    return true;
  }
  return false;
} //userIsEmployee

/**
 * Checks if the users role is manager.
 *
 * @returns boolean - true if the user is a manager
 */
function userIsManager() {
  return getRole() === 'manager';
}

export default {
  computed: {
    getCurrentAddress,
    getPlaceOfBirth
  },
  created,
  data() {
    return {
      userId: null,
      childrenVisible: true
    };
  },
  filters: {
    birthdayFeedResponse: (value) => {
      return value ? 'Yes' : 'No';
    }
  },
  methods: {
    checkEmptyPersonalInfo,
    isEmpty,
    monthDayYearFormat,
    userIsAdmin,
    userIsEmployee,
    userIsManager
  },
  props: ['admin', 'employee', 'model']
};
</script>
