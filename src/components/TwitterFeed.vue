<template class="twitter-feed">
  <div>
    <!-- title -->
    <v-card class="mt-3 white--text" color="#bc3825">
      <v-card-title class="header_style">
        <h3>Twitter Feed</h3>
      </v-card-title>
    </v-card>
    <!-- loading bar -->
    <v-card class="overflow-y-auto" max-height="676px">
      <div v-if="this.loading" class="py-4">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <!-- timeline -->
      <div v-else>
        <v-timeline dense>
          <v-timeline-item color="#bc3825" v-for="tweet in tweets" :key="tweet.name">
            <template v-slot:icon>
              <img src="../assets/img/case-logo-circle.png" class="twitter-icon" />
            </template>
            <h3>{{ tweet.created_at | formatDate }}</h3>
            <v-list-item
              :href="'https://twitter.com/ConsultwithCase/status/' + tweet.id_str"
              target="_blank"
              class="px-4"
            >
              <v-card flat class="transparent"
                >{{ tweet.full_text | fixHTMLencoding | removeLink }}&nbsp;<icon
                  height="12"
                  width="12"
                  name="external-link-alt"
                  color="blue"
                ></icon>
              </v-card>
            </v-list-item>
          </v-timeline-item>
        </v-timeline>
      </div>
    </v-card>
  </div>
</template>

<script>
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

export default {
  filters: {
    formatDate: function (date) {
      let now = moment();
      let tweetDate = moment(date, 'ddd MMM DD HH:mm:ss ZZ YYYY');
      let diff = now.startOf('day').diff(tweetDate.startOf('day'), 'day');
      if (diff == 0) {
        return 'Today'; //set date message as today if no difference in date
      } else if (diff == 1) {
        return 'Yesterday'; //if it was one day removed message is yesterday
      } else if (diff <= 6 && diff > 1) {
        return diff + ' days ago'; //if it is otherwise less than 7 days ago create message
      } else if (diff == -1) {
        return 'Tomorrow';
      } else {
        return tweetDate.format('ll');
      }
    },
    removeLink: function (tweet) {
      let splits = [];
      splits = tweet.split('https');
      if (splits.length > 1) {
        splits.pop();
      }
      return splits.join('https');
    },
    fixHTMLencoding: function (tweet) {
      var newTweet = tweet;
      if (tweet.includes('&amp;')) {
        newTweet = newTweet.replace('&amp;', '&');
      }
      if (tweet.includes('&lt;')) {
        newTweet = newTweet.replace('&lt;', '<');
      }
      if (tweet.includes('&gt;')) {
        newTweet = newTweet.replace('&gt;', '>');
      }
      if (tweet.includes('&quot;')) {
        newTweet = newTweet.replace('&quot;', '"');
      }
      if (tweet.includes('&apos;')) {
        newTweet = newTweet.replace('&apos;', "'");
      }
      if (tweet.includes('&cent;')) {
        newTweet = newTweet.replace('&cent;', '¢');
      }
      if (tweet.includes('&yen;')) {
        newTweet = newTweet.replace('&yen;', '¥');
      }
      if (tweet.includes('&euro;')) {
        newTweet = newTweet.replace('&euro;', '€');
      }
      if (tweet.includes('&copy;')) {
        newTweet = newTweet.replace('&copy;', '©');
      }
      if (tweet.includes('&reg;')) {
        newTweet = newTweet.replace('&reg;', '®');
      }
      if (tweet.includes('&trade;')) {
        newTweet = newTweet.replace('&trade;', '™');
      }
      return newTweet;
    }
  },
  props: ['tweets', 'loading']
};
</script>
