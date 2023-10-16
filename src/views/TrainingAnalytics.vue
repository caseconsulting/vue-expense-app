<!-- eslint-disable vue/no-v-text-v-html-on-component -->
<template>
  <v-row>
    <v-container class="my-3">
      <v-row class="py-3">
        <v-col cols="12" sm="4">
          <h1 class="pl-2">Training</h1>
        </v-col>

        <v-col class="mb-1" cols="12" sm="8">
          <v-text-field variant="underlined" v-model="search" hide-details single-line append-inner-icon="fa:fas fa-search" label="Search"></v-text-field>
        </v-col>
      </v-row>

      <!-- Category Filter Buttons -->
      <v-col cols="12" class="text-center">
        <v-row justify="center" class="py-2">
          <!-- Training Button -->
          <div v-for="category in categories" :key="category.value">
            <v-btn
              @click="filterByCategory(category.value)"
              class="mx-3"
              height="90"
              width="90"
              elevation="6"
              :rounded="isFocus(category.value)"
              theme="dark"
              size="large"
              color="#bc3825"
              icon
            >
              <v-icon size="x-large" :icon="category.icon" />
            </v-btn>
            <h4>{{ category.value }}</h4>
          </div>
        </v-row>
      </v-col>
      <!-- End Category Filter Button -->

      <!-- Button/Urls Divider -->
      <hr class="my-7" />

      <v-col class="py-3" cols="12">
        <!-- List all url info -->
        <div v-for="url in this.urls" :key="url.id">
          <v-row class="pb-1" dense>
            <v-col cols="12">
              <v-card color="#565651" dark :href="url.id" target="_blank">
                <v-row class="ma-1" dense>
                  <v-col cols="12" sm="3" md="2" xl="1" class="d-flex align-center justify-center">
                    <v-avatar class="ma-1 iconImage" size="80">
                      <v-img :src="url.display" :class="{ caseImage: url.isCaseLogo }" @error="changeDisplay(url)" />
                    </v-avatar>
                    <h3 v-if="url.publisher">{{ url.publisher }}</h3>
                  </v-col>

                  <v-col cols="12" sm="9" md="10" xl="11" class="py-0">
                    <v-row no-gutters class="fill-height">
                      <v-col cols="12">
                        <!-- Title and Description -->
                        <div v-if="!isEmpty(url.title)">
                          <v-card-title class="text-h5">{{ url.title }}</v-card-title>
                          <v-card-subtitle>{{ url.description }}</v-card-subtitle>
                        </div>

                        <!-- No title or Description -->
                        <div v-else class="urlBox pt-4">{{ url.id }}</div>
                      </v-col>
                      <v-col cols="12" align-self="end">
                        <!-- Hit Count -->
                        <v-spacer></v-spacer>
                        <div class="mr-2">
                          <span class="subheading hitText">{{ url.hits }}</span>
                          <v-icon class="hitIcon" scale="1">mdi-target</v-icon>
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
 * Changes the webiste image to if it fails to display original. If the url fails
 * to display a logo, the image will be display. If the image fails as well,
 * the website will default to the case logo.
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
 * Checks if a category is already the focus. Returns true if the category
 * was already selected, otherwise returns false.
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
  let title = value.length > 130 ? value.substring(0, 130) + '...' : value;
  return title;
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
  let allURLS = await api.getItems(api.TRAINING_URLS);
  this.urlsOriginal = _.forEach(allURLS, (urlObject) => {
    urlObject.title = this.titleFormat(urlObject.title);
    if (urlObject.logo != null) {
      urlObject.display = urlObject.logo;
    } else if (urlObject.image != null) {
      urlObject.display = urlObject.image;
    } else {
      urlObject.display = caseLogo;
      urlObject.isCaseLogo = true;
    }
  });
} // created

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
      caseLogo, // default case logo
      categoryFilter: 'All', // category filter
      search: '', // search filter
      urlsShow: [], // training urls to display
      urlsOriginal: [], // all training urls,
      categories: [
        {
          value: 'Training',
          icon: 'fa:fas fa-dumbbell'
        },
        {
          value: 'Conference',
          icon: 'fa:fas fa-user-friends'
        },
        {
          value: 'Certifications',
          icon: 'fa:fas fa-star'
        },
        {
          value: 'Lodging',
          icon: 'fa:fas fa-bed'
        },
        {
          value: 'Travel',
          icon: 'fa:fas fa-plane'
        },
        {
          value: 'Meals',
          icon: 'fa:fas fa-utensils'
        }
      ] // categories for button filters
    };
  },
  methods: {
    changeDisplay,
    filterByCategory,
    isEmpty,
    isFocus,
    titleFormat
  }
};
</script>

<style scoped>
.iconImage {
  border-radius: 0.3em;
}

.caseImage {
  background-color: white;
}

.hitIcon {
  color: white;
  fill: white;
  margin-bottom: 3px;
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
