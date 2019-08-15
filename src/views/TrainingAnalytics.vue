<template>
  <v-container>
    <div>
      <h1 style="text-align:center; padding:0px;">Trending</h1>
    </div>

    <br />
    <div class="text-center">
      <center>
        <v-btn class="mx-3 trend-bubble" fab dark large color="primary">
          <v-icon dark class="trend-icon">remove</v-icon></v-btn
        >

        <v-btn class="mx-3 trend-bubble" fab dark large color="pink">
          <v-icon dark class="trend-icon">favorite</v-icon>
        </v-btn>

        <v-btn class="mx-3 trend-bubble" fab dark large color="indigo">
          <v-icon dark class="trend-icon">add</v-icon>
        </v-btn>

        <v-btn class="mx-3 trend-bubble" fab dark large color="teal">
          <v-icon dark class="trend-icon">list</v-icon>
        </v-btn>

        <v-btn class="mx-3 trend-bubble" fab dark large color="cyan">
          <v-icon dark class="trend-icon">edit</v-icon>
        </v-btn>

        <v-btn class="mx-3 trend-bubble" fab dark large color="purple">
          <v-icon dark class="trend-icon">android</v-icon>
        </v-btn>
      </center>

      <br />

      <hr />
      <br />
      <p v-for="url in this.urlsNoDuplicates" :key="url.id">
        <v-flex xs12 sm6 offset-sm3>
          <v-card>
            <v-layout>
              <v-flex xs3>
                <img class="url-image" src="../assets/img/logo-big.png" />
                <!-- generic image (change later, could be based on category?) -->
              </v-flex>
              <v-flex>
                <v-card-title primary-title style="padding-top: 25px;">
                  <div>
                    <h1>{{ url.title }}</h1>
                    <a style="font-size: 20px;" :href="url.id" target="_blank">{{ url.id }}</a>
                    <div>Number of Hits: {{ url.hits }}</div>
                  </div>
                </v-card-title>
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </p>
    </div>
  </v-container>
</template>
<script>
import api from '@/shared/api.js';
import _ from 'lodash';

async function getUrls() {
  this.urls = await api.getItems(api.URLS);
  _.forEach(this.urls, urlObject => {
    // urlObject.title =
    let split = urlObject.id.split('https://');
    let title = split[0] || split[1];
    split = title.split('http://');
    title = split[0] || split[1];
    urlObject.title = title.split('.')[0];
    console.log(urlObject.title);
  });
  return this.urls;
}

//removes duplicates, combines hits numbers, and sorts by hits then alphabetically
//for main training page (no filters)
function getUrlNoDuplicates() {
  let noDuplicates = [];
  _.forEach(this.urls, urlObject => {
    let url = urlObject.id;
    let duplicate = _.find(noDuplicates, duplicate => {
      return url === duplicate.id;
    });
    if (duplicate) {
      duplicate.hits += urlObject.hits;
    } else {
      noDuplicates.push({ id: url, hits: urlObject.hits, title: urlObject.title });
    }
  }); //creates new list with no url duplicates and adds all hits for same url
  return _.orderBy(
    noDuplicates,
    [
      'hits', //sort by hits
      urlObject => {
        //sort by url, disregarding https, http
        let split = urlObject.id.split('https://');
        let newUrl = split[0] || split[1];
        split = newUrl.split('http://');
        return split[0] || split[1];
      }
    ],
    ['desc', 'asc']
  );
}

export default {
  data() {
    return {
      urls: [],
      urlsNoDuplicates: []
    };
  },
  methods: {
    getUrls,
    getUrlNoDuplicates
  },
  mounted() {
    this.getUrls().then(() => {
      this.urlsNoDuplicates = this.getUrlNoDuplicates();
    });
  }
};
</script>
<style>
/* Trending Filters */

.t {
  font-size: 80px;
}

.trend-bubble {
  padding-top: 20px !important;
  padding-bottom: 80px !important;
  padding-left: 50px !important;
  padding-right: 50px !important;
}

.trend-icon {
  font-size: 60px !important;
}

/* Cards for the URL Posts */

.url-card {
  padding: 10px;
}

.url-image {
  max-width: 150px;
  max-height: 150px;
}

.url-info {
  display: inline;
  border: 2px solid black;
  min-width: 100%;
  min-height: 100%;
}
</style>
