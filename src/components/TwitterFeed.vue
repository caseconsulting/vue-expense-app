<template class="twitter-feed">
  <v-flex pa-0>
    <!-- title -->
    <v-card class="white--text" color="#bc3825">
      <v-card-title class="header_style">
        <h4>Twitter Feed</h4>
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
                >{{ tweet.full_text | removeLink }}&nbsp;<icon
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
  </v-flex>
</template>

<script>
import moment from 'moment';

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
    }
  },
  props: ['tweets', 'loading']
};
</script>
