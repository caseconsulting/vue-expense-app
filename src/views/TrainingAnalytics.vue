<template>
  <v-layout row justify-center>
    <v-flex xs12>
      <h1 class="text-center">Trending</h1>
    </v-flex>

    <br />

    <!-- category buttons -->
    <v-flex xs12 class="text-center">
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
          <v-btn @click="filterByCategory('Certifications')" class="mx-3 pa-12" fab dark large color="orange" v-on="on">
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
    </v-flex>
    <!-- end category buttons -->

    <br />
    <hr />

    <v-flex xs12 class="text-center">
      <div>Category: {{ categoryFilter }}</div>
    </v-flex>

    <br />

    <v-flex xs12>
      <!-- list all url info -->
      <div v-for="url in this.urls" :key="url.id">
        <v-container class="py-0 text-center">
          <v-row dense>
            <v-col cols="12">
              <v-card color="#565651" dark :href="url.id" target="_blank">
                <v-layout wrap class="ma-1">
                  <v-flex xs12 sm3 md2 xl1>
                    <v-avatar class="ma-1" size="100" tile>
                      <img :src="url.display" :class="{ caseImage: url.isCaseLogo }" @error="changeDisplay(url)" />
                    </v-avatar>
                    <h3 v-if="!isEmpty(url.title)">{{ url.publisher }}</h3>
                  </v-flex>

                  <v-flex xs12 sm9 md10 xl11>
                    <v-layout column justify-space-between fill-height>
                      <!-- title and description -->
                      <div v-if="!isEmpty(url.title)">
                        <v-card-title class="headline" v-text="url.title"></v-card-title>
                        <v-card-subtitle v-text="url.description"></v-card-subtitle>
                      </div>

                      <!-- no title or description -->
                      <div v-else class="urlBox pt-4">{{ url.id }}</div>

                      <!-- hit count -->
                      <div class="mr-2">
                        <span v-if="isEmpty(url.title)" style="float: left">{{ url.publisher }}</span>
                        <span class="subheading hitText">{{ url.hits }}</span>
                        <icon name="fire" class="hitIcon" scale="1"></icon>
                      </div>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
let caseLogo = require('../assets/img/logo-big.png');

//METHODS

async function getUrls() {
  this.urlsOriginal = await api.getItems(api.URLS);
  _.forEach(this.urlsOriginal, urlObject => {
    urlObject.title = titleFormat(urlObject.title);

    urlObject.display = urlObject.logo;
  });
  return this.urlsOriginal;
}

/*
 * Changes the website image upon error displaying
 */
function changeDisplay(item) {
  let index = _.findIndex(this.urlsOriginal, url => {
    return url.id === item.id && url.category === item.category;
  });

  let newItem = this.urlsOriginal[index];

  if (newItem.display === item.logo && item.image != item.logo) {
    newItem.display = item.image;
  } else {
    newItem.display = caseLogo;
    newItem.isCaseLogo = true;
  }
  this.urlsOriginal.splice(index, 1, newItem);
}

function titleFormat(value) {
  // if the title from metadata is invalid (e.g. '{{...' ) return empty string
  if (value.length >= 2 && value[0] === '{' && value[1] === '{') {
    return undefined;
  }
  return value;
}

function filterByCategory(category) {
  this.categoryFilter = category;
}

function isEmpty(item) {
  return !item || item.trim().length <= 0;
}

//COMPUTED

function urls() {
  let filteredUrls = [];
  if (this.categoryFilter != 'All') {
    filteredUrls = _.filter(this.urlsOriginal, url => {
      return url.category === this.categoryFilter;
    });
  } else {
    let urls = _.cloneDeep(this.urlsOriginal);
    _.forEach(urls, urlObject => {
      let url = urlObject.id;
      let dupIndex = _.findIndex(filteredUrls, duplicate => {
        return url === duplicate.id;
      });
      if (dupIndex != -1) {
        filteredUrls[dupIndex].hits += urlObject.hits;
      } else {
        filteredUrls.push(urlObject);
      }
    }); //creates new list with no url duplicates and adds all hits for same url
  }
  return _.sortBy(filteredUrls, ['hits', 'id']).reverse();
}

async function created() {
  let allURLS = await api.getItems(api.URLS);
  this.urlsOriginal = _.forEach(allURLS, urlObject => {
    urlObject.title = titleFormat(urlObject.title);
    urlObject.display = urlObject.logo;
  });
}

export default {
  data() {
    return {
      caseLogo: caseLogo,
      urlsShow: [],
      categoryFilter: 'All',
      urlsOriginal: []
    };
  },
  methods: {
    getUrls,
    filterByCategory,
    changeDisplay,
    isEmpty
  },
  computed: {
    urls
  },
  created
};
</script>
<style>
/* Trending Filters */

.t {
  font-size: 80px;
}

.hitIcon {
  color: #bc3825;
  margin-top: 3px;
  margin-right: 3px;
  float: right;
}

.hitText {
  color: #bc3825;
  float: right;
}

.caseImage {
  background-color: #e9eef0;
}

.urlBox {
  overflow-wrap: break-word;
  word-wrap: break-word;
}
</style>
