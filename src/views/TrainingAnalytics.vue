<template>
  <v-layout row justify-center>
    <v-container>
      <v-row>
        <v-flex xs4>
          <h1 style="font-size: 35px;">Trainings</h1>
        </v-flex>

        <v-flex xs8>
          <v-toolbar color="white darken-3" class="mb-1" dense elevation="2">
            <v-text-field
              v-model="search"
              clearable
              flat
              hide-details
              prepend-inner-icon="search"
              label="Search"
              dense
            ></v-text-field>
          </v-toolbar>
        </v-flex>
      </v-row>

      <!-- category buttons -->
      <v-flex xs12 class="text-center">
        <v-row>
          <!-- Training button -->
          <div>
            <v-btn
              @click="filterByCategory('Training')"
              class="mx-3 pa-12"
              fab
              :rounded="isFocus('Training')"
              dark
              large
              color="#bc3825"
            >
              <v-icon dark class="pb-7" size="60px">fitness_center</v-icon>
            </v-btn>
            <h4>Training</h4>
          </div>
          <!-- end Training button -->
          <!-- Conference button -->
          <div>
            <v-btn
              @click="filterByCategory('Conference')"
              class="mx-3 pa-12"
              fab
              :rounded="isFocus('Conference')"
              dark
              large
              color="#bc3825"
            >
              <v-icon dark class="pb-7" size="60px">group</v-icon>
            </v-btn>
            <h4>Conference</h4>
          </div>
          <!-- end Conference button -->
          <!-- Certifications button -->
          <div>
            <v-btn
              @click="filterByCategory('Certifications')"
              class="mx-3 pa-12"
              fab
              :rounded="isFocus('Certifications')"
              dark
              large
              color="#bc3825"
            >
              <v-icon dark class="pb-7" size="60px">stars</v-icon>
            </v-btn>
            <h4>Certifications</h4>
          </div>
          <!-- end Certifications button -->
          <!-- Lodging button -->
          <div>
            <v-btn
              @click="filterByCategory('Lodging')"
              class="mx-3 pa-12"
              fab
              :rounded="isFocus('Lodging')"
              dark
              large
              color="#bc3825"
            >
              <v-icon dark class="pb-7" size="60px">hotel</v-icon>
            </v-btn>
            <h4>Lodging</h4>
          </div>
          <!-- end Lodging button -->
          <!-- Travel button -->
          <div>
            <v-btn
              @click="filterByCategory('Travel')"
              class="mx-3 pa-12"
              fab
              :rounded="isFocus('Travel')"
              dark
              large
              color="#bc3825"
            >
              <v-icon dark class="pb-7" size="60px">airplanemode_active</v-icon>
            </v-btn>
            <h4>Travel</h4>
          </div>
          <!-- end Travel button -->
          <!-- Meals button -->
          <div>
            <v-btn
              @click="filterByCategory('Meals')"
              class="mx-3 pa-12"
              fab
              :rounded="isFocus('Meals')"
              dark
              large
              color="#bc3825"
            >
              <v-icon dark class="pb-7" size="60px">restaurant</v-icon>
            </v-btn>
            <h4>Meals</h4>
          </div>
          <!-- end Meals button -->
        </v-row>
      </v-flex>
      <!-- end category buttons -->

      <!-- buttons/urls divider -->
      <br />
      <hr />
      <br />

      <v-flex xs12>
        <!-- list all url info -->
        <div v-for="url in this.urls" :key="url.id">
          <v-row dense>
            <v-col cols="12">
              <v-card color="#565651" dark :href="url.id" target="_blank">
                <v-layout wrap class="ma-1">
                  <v-flex xs12 sm3 md2 xl1 class="text-center">
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
                        <span v-if="isEmpty(url.title)" style="float: left;">{{ url.publisher }}</span>
                        <span class="subheading hitText">{{ url.hits }}</span>
                        <icon name="crosshairs" class="hitIcon" scale="1"></icon>
                      </div>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-flex>
    </v-container>
  </v-layout>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
let caseLogo = require('../assets/img/logo-big.png');

//METHODS

async function getUrls() {
  this.urlsOriginal = await api.getItems(api.URLS);
  _.forEach(this.urlsOriginal, (urlObject) => {
    urlObject.title = titleFormat(urlObject.title);

    urlObject.display = urlObject.logo;
  });
  return this.urlsOriginal;
}

/*
 * Changes the website image upon error displaying
 */
function changeDisplay(item) {
  let index = _.findIndex(this.urlsOriginal, (url) => {
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
  if (this.categoryFilter == category) {
    this.categoryFilter = 'All';
  } else {
    this.categoryFilter = category;
  }
}

function isEmpty(item) {
  return !item || item.trim().length <= 0;
}

function isFocus(value) {
  return value == this.categoryFilter;
}

//COMPUTED

function urls() {
  let filteredUrls = [];
  if (this.categoryFilter != 'All') {
    filteredUrls = _.filter(this.urlsOriginal, (url) => {
      return url.category === this.categoryFilter;
    });
  } else {
    let urls = _.cloneDeep(this.urlsOriginal);
    _.forEach(urls, (urlObject) => {
      let url = urlObject.id;
      let dupIndex = _.findIndex(filteredUrls, (duplicate) => {
        return url === duplicate.id;
      });
      if (dupIndex != -1) {
        filteredUrls[dupIndex].hits += urlObject.hits;
      } else {
        filteredUrls.push(urlObject);
      }
    }); //creates new list with no url duplicates and adds all hits for same url
  }
  if (!this.isEmpty(this.search)) {
    filteredUrls = _.filter(filteredUrls, (url) => {
      let includes =
        (url.title && url.title.toLowerCase().includes(this.search.toLowerCase())) ||
        (url.description && url.description.toLowerCase().includes(this.search.toLowerCase())) ||
        (url.id && url.id.toLowerCase().includes(this.search.toLowerCase())) ||
        (url.hits && url.hits.toString().includes(this.search));
      return includes;
    });
  }
  return _.sortBy(filteredUrls, ['hits', 'id']).reverse();
}

async function created() {
  let allURLS = await api.getItems(api.URLS);
  this.urlsOriginal = _.forEach(allURLS, (urlObject) => {
    urlObject.title = titleFormat(urlObject.title);
    urlObject.display = urlObject.logo;
  });
}

export default {
  data() {
    return {
      caseLogo: caseLogo,
      search: '',
      urlsShow: [],
      categoryFilter: 'All',
      urlsOriginal: []
    };
  },
  methods: {
    getUrls,
    filterByCategory,
    changeDisplay,
    isEmpty,
    isFocus
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
  background-color: white;
}

.urlBox {
  overflow-wrap: break-word;
  word-wrap: break-word;
}
</style>
