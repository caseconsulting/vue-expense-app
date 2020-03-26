<template>
  <v-container style="padding-top: 0px;">
    <div>
      <h1 style="text-align: center;">Trending</h1>
    </div>

    <br />
    <div class="text-center">
      <!-- category buttons -->
      <center>
        <!-- close button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn @click="filterByCategory('All')" class="mx-3" fab dark color="red" v-on="on">
              <v-icon dark>close</v-icon>
            </v-btn>
          </template>
          <span>Close</span>
        </v-tooltip>
        <!-- end close button -->
        <!-- Training button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn @click="filterByCategory('Training')" class="mx-3 pa-12" fab dark large color="primary" v-on="on">
              <v-icon dark class="pb-7" size="60px">fitness_center</v-icon>
            </v-btn>
          </template>
          <span>Training</span>
        </v-tooltip>
        <!-- end Training button -->
        <!-- Conference button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn @click="filterByCategory('Conference')" class="mx-3 pa-12" fab dark large color="pink" v-on="on">
              <v-icon dark class="pb-7" size="60px">group</v-icon>
            </v-btn>
          </template>
          <span>Conference</span>
        </v-tooltip>
        <!-- end Conference button -->
        <!-- Certifications button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              @click="filterByCategory('Certifications')"
              class="mx-3 pa-12"
              fab
              dark
              large
              color="orange"
              v-on="on"
            >
              <v-icon dark class="pb-7" size="60px">stars</v-icon>
            </v-btn>
          </template>
          <span>Certifications</span>
        </v-tooltip>
        <!-- end Certifications button -->
        <!-- Lodging button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn @click="filterByCategory('Lodging')" class="mx-3 pa-12" fab dark large color="indigo" v-on="on">
              <v-icon dark class="pb-7" size="60px">hotel</v-icon>
            </v-btn>
          </template>
          <span>Lodging</span>
        </v-tooltip>
        <!-- end Lodging button -->
        <!-- Travel button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn @click="filterByCategory('Travel')" class="mx-3 pa-12" fab dark large color="cyan" v-on="on">
              <v-icon dark class="pb-7" size="60px">airplanemode_active</v-icon>
            </v-btn>
          </template>
          <span>Travel</span>
        </v-tooltip>
        <!-- end Travel button -->
        <!-- Meals button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn @click="filterByCategory('Meals')" class="mx-3 pa-12" fab dark large color="purple" v-on="on">
              <v-icon dark class="pb-7" size="60px">restaurant</v-icon>
            </v-btn>
          </template>
          <span>Meals</span>
        </v-tooltip>
        <!-- end Meals button -->
        <a style="padding-right: 89px;"> </a>
      </center>
      <!-- end category buttons -->
      <br />
      <hr />
      <div>Category: {{ categoryFilter }}</div>
      <br />
      <p v-for="url in this.urls" :key="url.id">
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

//METHODS

async function getUrls() {
  this.urlsOriginal = await api.getItems(api.URLS);
  _.forEach(this.urlsOriginal, urlObject => {
    let split = urlObject.id.split('https://');
    let title = split[0] || split[1];
    split = title.split('http://');
    title = split[0] || split[1];
    urlObject.title = title.split('.')[0];
  });
  return this.urlsOriginal;
}

//removes duplicates, combines hits numbers, and sorts by hits then alphabetically
//for main training page (no filters)
function getUrlNoDuplicates() {
  let noDuplicates = [];
  _.forEach(this.urlsOriginal, urlObject => {
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

function filterByCategory(category) {
  this.categoryFilter = category;
}

//COMPUTED

function urls() {
  if (this.categoryFilter != 'All') {
    return _.filter(this.urlsOriginal, url => {
      console.log(url.category);
      return url.category === this.categoryFilter;
    });
  } else {
    return this.urlsShow;
  }
}

export default {
  data() {
    return {
      urlsShow: [],
      categoryFilter: 'All',
      urlsOriginal: [],
      urlsNoDuplicates: []
    };
  },
  methods: {
    getUrls,
    getUrlNoDuplicates,
    filterByCategory
  },
  computed: {
    urls
  },
  mounted() {
    this.getUrls().then(() => {
      this.urlsNoDuplicates = this.getUrlNoDuplicates();
      this.urlsShow = this.urlsNoDuplicates; //start out with no duplicates
    });
  }
};
</script>
<style>
/* Trending Filters */

.t {
  font-size: 80px;
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
