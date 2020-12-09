<template>
  <v-row>
    <v-container>
      <v-row>
        <v-col cols="12" sm="4">
          <h1 style="font-size: 35px">Trainings</h1>
        </v-col>

        <v-col cols="12" sm="8">
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
        </v-col>
      </v-row>

      <!-- Category Filter Buttons -->
      <v-col cols="12" class="text-center">
        <v-row>
          <!-- Training Button -->
          <div v-for="category in categories" :key="category.value">
            <v-btn
              @click="filterByCategory(category.value)"
              class="mx-3 pa-12"
              fab
              :rounded="isFocus(category.value)"
              dark
              large
              color="#bc3825"
            >
              <v-icon dark size="60px">{{ category.icon }}</v-icon>
            </v-btn>
            <h4>{{ category.value }}</h4>
          </div>
        </v-row>
      </v-col>
      <!-- End Category Filter Button -->

      <!-- Button/Urls Divider -->
      <hr class="my-6" />

      <v-col cols="12">
        <!-- List all url info -->
        <div v-for="url in this.urls" :key="url.id">
          <v-row dense>
            <v-col cols="12">
              <v-card color="#565651" dark :href="url.id" target="_blank">
                <v-row class="ma-1" dense>
                  <v-col cols="12" sm="3" md="2" xl="1" class="text-center">
                    <v-avatar class="ma-1" size="100" tile>
                      <img :src="url.display" :class="{ caseImage: url.isCaseLogo }" @error="changeDisplay(url)" />
                    </v-avatar>
                    <h3 v-if="url.publisher">{{ url.publisher }}</h3>
                  </v-col>

                  <v-col cols="12" sm="9" md="10" xl="11" class="py-0">
                    <v-row no-gutters class="fill-height">
                      <v-col cols="12">
                        <!-- Title and Description -->
                        <div v-if="!isEmpty(url.title)">
                          <v-card-title class="headline" v-text="url.title"></v-card-title>
                          <v-card-subtitle v-text="url.description"></v-card-subtitle>
                        </div>

                        <!-- No title or Description -->
                        <div v-else class="urlBox pt-4">{{ url.id }}</div>
                      </v-col>
                      <v-col cols="12" align-self="end">
                        <!-- Hit Count -->
                        <v-spacer></v-spacer>
                        <div class="mr-2">
                          <span class="subheading hitText">{{ url.hits }}</span>
                          <icon name="crosshairs" class="hitIcon" scale="1"></icon>
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </div>
        <div v-if="this.urls.length === 0" class="text-center">No Training URL with Category: {{ categoryFilter }}</div>
      </v-col>
    </v-container>
  </v-row>
</template>

<script>
import api from '@/shared/api.js';
import caseLogo from '@/assets/img/logo-big.png';
import _ from 'lodash';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Filters and sorts the list of training urls.
 *
 * @return Array - filtered training urls
 */
function urls() {
  let filteredUrls = [];
  if (this.categoryFilter != 'All') {
    // filter by category
    filteredUrls = _.filter(this.urlsOriginal, (url) => {
      return url.category === this.categoryFilter;
    });
  } else {
    // creates new list with no url duplicates and adds all hits for same url
    let urls = _.cloneDeep(this.urlsOriginal);
    _.forEach(urls, (urlObject) => {
      let url = urlObject.id;
      let dupIndex = _.findIndex(filteredUrls, (duplicate) => {
        return url === duplicate.id;
      });

      if (dupIndex != -1) {
        // url is a duplicate
        filteredUrls[dupIndex].hits += urlObject.hits;
      } else {
        // url is not a duplicate
        filteredUrls.push(urlObject);
      }
    });
  }

  if (!this.isEmpty(this.search)) {
    // filter by serach
    filteredUrls = _.filter(filteredUrls, (url) => {
      let includes =
        (url.title && url.title.toLowerCase().includes(this.search.toLowerCase())) ||
        (url.description && url.description.toLowerCase().includes(this.search.toLowerCase())) ||
        (url.id && url.id.toLowerCase().includes(this.search.toLowerCase())) ||
        (url.hits && url.hits.toString().includes(this.search));
      return includes;
    });
  }

  return _.sortBy(filteredUrls, ['hits', 'id']).reverse(); // sort by most hits
} // urls

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Changes the webiste image to if it fails to display original. If the url fails to display a logo, the image will be
 * display. If the image fails as well, the website will default to the case logo.
 *
 * @param item - training url
 */
function changeDisplay(item) {
  let index = _.findIndex(this.urlsOriginal, (url) => {
    return url.id === item.id && url.category === item.category;
  });

  let newItem = this.urlsOriginal[index];

  if (newItem.display === item.logo && item.image != item.logo && item.image != null) {
    newItem.display = item.image;
  } else {
    newItem.display = caseLogo;
    newItem.isCaseLogo = true;
  }
  this.urlsOriginal.splice(index, 1, newItem);
} // changeDisplay

/**
 * Set category filter for training urls.
 *
 * @param category - category to filter by
 */
function filterByCategory(category) {
  if (this.categoryFilter == category) {
    this.categoryFilter = 'All';
  } else {
    this.categoryFilter = category;
  }
} // filterByCategory

/**
 * Get all aggregate trining urls.
 *
 * @return Array - training urls
 */
async function getUrls() {
  this.urlsOriginal = await api.getItems(api.URLS);
  _.forEach(this.urlsOriginal, (urlObject) => {
    urlObject.title = titleFormat(urlObject.title);

    urlObject.display = urlObject.logo;
  });
  return this.urlsOriginal;
} // getUrls

/**
 * Checks if a category is already the focus. Returns true if the category was already selected, otherwise returns
 * false.
 *
 * @param value - category selected
 * @return boolean - category was already selected
 */
function isFocus(value) {
  return value == this.categoryFilter;
} // isFocus

/**
 * Removes url titles with an invalid format.
 *
 * @param value - url title
 * @return String - validated title
 */
function titleFormat(value) {
  // if the title from metadata is invalid (e.g. '{{...' ) return empty string
  if (value == null || (value.length >= 2 && value[0] === '{' && value[1] === '{')) {
    return undefined;
  }
  return value;
} // titleFormat

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all training urls.
 */
async function created() {
  let allURLS = await api.getItems(api.URLS);
  this.urlsOriginal = _.forEach(allURLS, (urlObject) => {
    urlObject.title = titleFormat(urlObject.title);
    if (urlObject.logo != null) {
      urlObject.display = urlObject.logo;
    } else if (urlObject.image != null) {
      urlObject.display = urlObject.image;
    } else {
      urlObject.display = caseLogo;
      urlObject.isCaseLogo = true;
    }
  });
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    urls
  },
  created,
  data() {
    return {
      caseLogo: caseLogo, // default case logo
      categoryFilter: 'All', // category filter
      search: '', // search filter
      urlsShow: [], // training urls to display
      urlsOriginal: [], // all training urls,
      categories: [
        {
          value: 'Training',
          icon: 'fitness_center'
        },
        {
          value: 'Conference',
          icon: 'group'
        },
        {
          value: 'Certifications',
          icon: 'stars'
        },
        {
          value: 'Lodging',
          icon: 'hotel'
        },
        {
          value: 'Travel',
          icon: 'airplanemode_active'
        },
        {
          value: 'Meals',
          icon: 'restaurant'
        }
      ] // categories for button filters
    };
  },
  methods: {
    changeDisplay,
    filterByCategory,
    getUrls,
    isEmpty,
    isFocus
  }
};
</script>

<style scoped>
.caseImage {
  background-color: white;
}

.hitIcon {
  color: white;
  margin-top: 3px;
  margin-right: 3px;
  float: right;
}

.hitText {
  color: white;
  float: right;
}

.t {
  font-size: 80px;
}

.urlBox {
  overflow-wrap: break-word;
  word-wrap: break-word;
}
</style>
