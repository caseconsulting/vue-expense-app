<template>
  <div class="timer">
    <v-tooltip bottom>
      <div value="active" slot="activator">
        <!-- display timer after 5 minute warning -->
        <p v-if="timeRemaining > 0 && timeRemaining <= 300">{{ minutes }}:{{ seconds | two_digits }}</p>

        <!-- display when session times out -->
        <p v-else-if="timeRemaining <= 0">Session Timed Out</p>
      </div>
      <span>Session Remaining</span>
    </v-tooltip>
  </div>
</template>

<script>
import { getTokenExpirationDate, getAccessToken } from '@/utils/auth';

/* COMPUTED */

/*
 * Returns seconds remaing before session access token expires. Emits 5 minute warning and session timeout.
 */
function timeRemaining() {
  let timeRemaining = this.date - this.now;

  if (timeRemaining === 300) {
    window.EventBus.$emit('sessionWarning');
  }

  if (timeRemaining <= 0) {
    window.EventBus.$emit('sessionTimedOut');
  }
  return timeRemaining;
}

/*
 * Computes the seconds displayed for the timer
 */
function seconds() {
  return this.timeRemaining % 60;
}

/*
 * Computes the minutes displayed for the timer
 */
function minutes() {
  return Math.trunc(this.timeRemaining / 60) % 60;
}

/* LIFECYCLE HOOKS */

async function created() {
  window.setInterval(() => {
    this.now = Math.trunc(new Date().getTime() / 1000);
  }, 1000);
}

export default {
  filters: {
    two_digits: (value) => {
      if (value.toString().length <= 1) {
        return '0' + value.toString();
      }
      return value.toString();
    }
  },
  data() {
    return {
      now: Math.trunc(new Date().getTime() / 1000),
      date: Math.trunc(getTokenExpirationDate(getAccessToken()).getTime() / 1000 - 7190)
    };
  },
  computed: {
    timeRemaining,
    seconds,
    minutes
  },
  created
};
</script>
