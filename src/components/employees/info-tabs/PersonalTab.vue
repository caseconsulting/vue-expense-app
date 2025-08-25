<template>
  <div v-if="childrenVisible" class="infoTab wrapper" id="personalTab">
    <!-- GitHub -->
    <p v-if="!isEmpty(this.model.github)">
      <v-avatar class="mr-3 nudge-right" rounded="0" size="20">
        <v-img class="grayImage" :src="github" alt="Github icon"></v-img>
      </v-avatar>
      <a :href="'https://github.com/' + this.model.github" target="_blank">{{ this.model.github }}</a>
    </p>
    <!-- Twitter -->
    <p v-if="!isEmpty(this.model.twitter)">
      <v-avatar class="mr-3 nudge-right" rounded="0" size="20">
        <v-img class="grayImage" :src="x" alt="X icon"></v-img>
      </v-avatar>
      <a :href="'https://x.com/' + this.model.twitter" target="_blank">{{ this.model.twitter }}</a>
    </p>
    <!-- LinkedIn -->
    <p v-if="!isEmpty(this.model.linkedIn)">
      <v-avatar class="mr-3 nudge-right" rounded="0" size="20">
        <v-img class="grayImage" :src="linkedin" alt="LinkedIn icon`"></v-img>
      </v-avatar>
      <a :href="this.model.linkedIn" target="_blank">{{ this.model.linkedIn }}</a>
    </p>
    <!-- Personal Email -->
    <p v-if="!isEmpty(this.model.personalEmail) && (admin || employee)">
      <v-icon size="large" class="mr-2 grayImage">mdi-email</v-icon> {{ this.model.personalEmail }}
    </p>
    <!-- Phone Number -->
    <p v-if="!isEmpty(getPhoneNumbers()) && (employee || !userRoleIsIntern())">
      <b>Phone Numbers:</b>
      <v-list class="left-border">
        <v-list-item v-for="number in getPhoneNumbers()" :key="number.number">
          <template v-slot:prepend>
            <v-avatar variant="text" icon class="mr-2">
              <v-tooltip activator="parent" location="bottom">
                <span v-if="number.private"
                  >Based on user preference, this is only visible to You, Managers, and Admins</span
                >
                <span v-else>Based on user preference, this is visible to everyone</span>
              </v-tooltip>
              <v-icon size="large" color="grey-darken-1" v-if="number.private">mdi-shield</v-icon>
              <v-icon size="large" color="grey-darken-1" v-else>mdi-shield-outline</v-icon>
            </v-avatar>
          </template>
          <v-list-item-subtitle class="mb-1"> {{ number.type }}</v-list-item-subtitle>
          <v-list-item-title>
            <div>
              {{ number.number }}<span v-if="number.ext"> (Ext. {{ number.ext }})</span>
            </div>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </p>
    <!-- Birthday Feed -->
    <p v-if="!isEmpty(this.model.birthdayFeed) && (admin || employee)">
      <b>Birthday on Feed:</b> {{ birthdayFeedResponse(this.model.birthdayFeed) }}
    </p>
    <!-- Birthday -->
    <sensitive-data-field
      v-if="!isEmpty(this.model.birthday) & (admin || employee)"
      :class="isBday ? 'pointer' : ''"
      class="mb-5"
      @click="confetti"
      label="Birthday"
      :value="monthDayYearFormat(this.model.birthday)"
    />
    <!-- Place of Birth -->
    <sensitive-data-field
      v-if="!isEmpty(getPlaceOfBirth) && (admin || employee)"
      label="Place of Birth"
      class="mb-5"
      :value="getPlaceOfBirth"
    />
    <!-- Current Address -->
    <p v-if="!isEmpty(getCurrentAddress) && (employee || !userRoleIsIntern())">
      <b>Current Address:</b> {{ getCurrentAddress }}
    </p>
  </div>
  <p v-else>No Personal Information</p>
</template>

<script>
import { isEmpty, monthDayYearFormat, userRoleIsIntern } from '@/utils/utils';
import { format, getTodaysDate } from '@/shared/dateUtils';
import SensitiveDataField from '../SensitiveDataField.vue';
import github from '@/assets/img/trademarks/github.png';
import linkedin from '@/assets/img/trademarks/linkedin.png';
import x from '@/assets/img/trademarks/x.png';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  let user = this.$store.getters.user;
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
  // this is crap code but I needed a quick-fix for the code that was here and causing an error. :W
  if (
    this.model.github ||
    this.model.twitter ||
    this.model.linkedIn ||
    !isEmpty(this.model.privatePhoneNumbers) ||
    !isEmpty(this.model.publicPhoneNumbers) ||
    this.model.birthday ||
    this.model.birthdayFeed ||
    this.getPlaceOfBirth ||
    this.getCurrentAddress
  ) {
    this.childrenVisible = true;
  } else {
    this.childrenVisible = false;
  }
} // checkEmptyPersonalInfo

/**
 * Returns Employee's Current Address.
 *
 * @return String - current address.
 */
function getCurrentAddress() {
  let currentAddress = '';
  if (!this.isEmpty(this.model.currentStreet)) {
    if (!this.isEmpty(this.model.currentStreet2)) {
      currentAddress += `${this.model.currentStreet} ${this.model.currentStreet2}, `;
    } else {
      currentAddress += `${this.model.currentStreet}, `;
    }
  }
  if (!this.isEmpty(this.model.currentCity)) {
    currentAddress += `${this.model.currentCity}, `;
  }
  if (!this.isEmpty(this.model.currentState)) {
    currentAddress += `${this.model.currentState} `;
  }
  if (!this.isEmpty(this.model.currentZIP)) {
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
  if (!this.isEmpty(this.model.city)) {
    placeOfBirth += `${this.model.city}, `;
  }
  if (!this.isEmpty(this.model.st)) {
    placeOfBirth += `${this.model.st}, `;
  }
  if (!this.isEmpty(this.model.country)) {
    placeOfBirth += `${this.model.country}, `;
  }

  placeOfBirth = placeOfBirth.slice(0, -2);
  return placeOfBirth;
} // getPlaceOfBirth

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets phone numbers from the two lists (public and private) and merges them into one.
 *
 * @return - list: all phone numbers from the user
 */
function getPhoneNumbers() {
  let phoneNumbers = [];
  if (this.model.privatePhoneNumbers) {
    phoneNumbers = phoneNumbers.concat(this.model.privatePhoneNumbers);
  }
  if (this.model.publicPhoneNumbers) {
    phoneNumbers = phoneNumbers.concat(this.model.publicPhoneNumbers);
  }
  return phoneNumbers;
} // getPhoneNumbers

/**
 * Allows the user to utilize their cursor and clicking functionality
 * as a method of element generation that uses the CSS visual effects
 */
function confetti() {
  if (this.isBday()) {
    console.log('It is not your birthday!');
    return;
  }
  let wrapper = document.getElementsByClassName('wrapper')[0];
  let numConfetti = 150;
  for (let i = 0; i < numConfetti; i++) {
    let newDiv = document.createElement('div');
    newDiv.classList.add(`confetti-${i}`);
    var delay = Math.floor(Math.random() * 7);
    setTimeout(function () {
      wrapper.prepend(newDiv);
    }, delay * 1000);
  }
} // confetti

/**
 * Returns true if it is the user's birthday today.
 *
 * @return boolean - true if it is a user's birthday
 */
function isBday() {
  return format(getTodaysDate(), null, 'MM-DD') != format(this.model.birthday, null, 'MM-DD');
} // isBday

// |--------------------------------------------------|
// |                                                  |
// |                     FILTERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * filter to replace boolean with yes/no
 *
 * @param value - boolean value to check
 * @return yes if value is true no otherwise
 */
function birthdayFeedResponse(value) {
  return value ? 'Yes' : 'No';
} // birthdayFeedResponse

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    getCurrentAddress,
    getPlaceOfBirth
  },
  created,
  data() {
    return {
      github,
      x,
      linkedin,
      userId: null,
      childrenVisible: true
    };
  },
  methods: {
    birthdayFeedResponse,
    checkEmptyPersonalInfo,
    confetti,
    format,
    getTodaysDate,
    isBday,
    isEmpty,
    monthDayYearFormat,
    userRoleIsIntern,
    getPhoneNumbers
  },
  props: ['admin', 'employee', 'model'],
  components: { SensitiveDataField }
};
</script>

<style scoped lang="scss">
@use "sass:list";
@use "sass:string";
@use "sass:math";

p {
  margin-bottom: 12px;
}

.wrapper {
  position: relative;
}

.grayImage {
  -webkit-filter: brightness(0) opacity(55%);
  filter: brightness(0) opacity(55%);
}

.nudge-right {
  margin-left: 2px;
}

[class|='confetti'] {
  position: absolute;
}

$colors: (#d13447, #ffbf00, #263672);

// stylelint-disable scss/function-unquote-no-unquoted-strings-inside
// stylelint-disable scss/no-global-function-names
@for $i from 0 through 150 {
  $w: math.random(8);
  $l: math.random(98);
  .confetti-#{$i} {
    width: #{$w}px;
    height: #{$w * 0.4}px;
    background-color: list.nth($colors, math.random(3));
    top: -10%;
    left: string.unquote($l + '%');
    opacity: math.random() + 0.5;
    transform: rotate(#{math.random() * 360}deg);
    animation: drop-#{$i} string.unquote(4 + math.random() + 's') string.unquote(math.random() + 's') infinite;
  }

  @keyframes drop-#{$i} {
    100% {
      top: 110%;
      left: string.unquote($l + math.random(15) + '%');
    }
  }
}
// stylelint-enable scss/function-unquote-no-unquoted-strings-inside
// stylelint-enable scss/no-global-function-names
</style>
