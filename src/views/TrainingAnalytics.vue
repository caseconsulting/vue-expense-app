<!-- eslint-disable vue/no-v-text-v-html-on-component -->
<template>
  <v-row>
    <v-container class="my-3">
      <v-row class="py-3">
        <v-col cols="12" sm="4">
          <h1 class="pl-2">Training</h1>
        </v-col>

        <v-col class="mb-1" cols="12" sm="8">
          <v-text-field
            v-model="search"
            variant="underlined"
            hide-details
            single-line
            append-inner-icon="mdi-magnify"
            label="Search"
          />
        </v-col>
      </v-row>

      <!-- Category Filter Buttons -->
      <v-col cols="12" class="text-center">
        <v-row justify="center" class="py-2">
          <!-- Training Button -->
          <div v-for="category in categories" :key="category.value">
            <v-btn
              class="mx-3"
              height="90"
              width="90"
              elevation="6"
              :rounded="isFocus(category.value)"
              theme="dark"
              size="x-large"
              color="#bc3825"
              icon
              @click="filterByCategory(category.value)"
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
        <div v-for="url in urls" :key="url.id">
          <v-row class="pb-1" dense>
            <v-col cols="12">
              <v-card color="#565651" dark :href="url.id" target="_blank">
                <v-row class="ma-1" dense>
                  <v-col cols="12" sm="3" md="2" xl="1" class="d-flex align-center justify-center">
                    <v-avatar class="ma-1 iconImage" size="80">
                      <v-img :src="url.display" :class="{ caseImage: url.isCaseLogo }" @error="changeDisplay(url)" />
                    </v-avatar>
                    <h3 v-if="url.publisher">
                      {{ url.publisher }}
                    </h3>
                  </v-col>

                  <v-col cols="12" sm="9" md="10" xl="11" class="py-0">
                    <v-row no-gutters class="fill-height">
                      <v-col cols="12">
                        <!-- Title and Description -->
                        <div v-if="!isEmpty(url.title)">
                          <v-card-title class="text-h5">
                            {{ url.title }}
                          </v-card-title>
                          <v-card-subtitle>{{ url.description }}</v-card-subtitle>
                        </div>

                        <!-- No title or Description -->
                        <div v-else class="urlBox pt-4">
                          {{ url.id }}
                        </div>
                      </v-col>
                      <v-col cols="12" align-self="end">
                        <!-- Hit Count -->
                        <v-spacer />
                        <div class="mr-2">
                          <span class="subheading hitText">{{ url.hits }}</span>
                          <v-icon class="hitIcon" scale="1"> mdi-target </v-icon>
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </div>
        <div v-if="urls.length === 0" class="text-center">No Training URL with Category: {{ categoryFilter }}</div>
      </v-col>
    </v-container>
  </v-row>
</template>

<script setup>
import api from '@/shared/api.js';
import caseLogo from '@/assets/img/logo-big.png';
import _forEach from 'lodash/forEach';
import _filter from 'lodash/filter';
import _cloneDeep from 'lodash/cloneDeep';
import _findIndex from 'lodash/findIndex';
import _sortBy from 'lodash/sortBy';
import { isEmpty } from '@/utils/utils';
import { ref, onBeforeMount, computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const categoryFilter = ref('All'); // category filter
const search = ref(''); // search filter
const urlsOriginal = ref([]); // all training urls,
const categories = ref([
  {
    value: 'Training',
    icon: 'mdi-dumbbell'
  },
  {
    value: 'Conference',
    icon: 'mdi-account-group'
  },
  {
    value: 'Certifications',
    icon: 'mdi-star'
  },
  {
    value: 'Lodging',
    icon: 'mdi-bed'
  },
  {
    value: 'Travel',
    icon: 'mdi-airplane'
  },
  {
    value: 'Meals',
    icon: 'mdi-silverware'
  }
]);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all training urls.
 */
onBeforeMount(async () => {
  let allURLS = await api.getItems(api.TRAINING_URLS);
  urlsOriginal.value = _forEach(allURLS, (urlObject) => {
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
}); // created

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
const urls = computed(() => {
  let filteredUrls = [];
  if (categoryFilter.value != 'All') {
    // filter by category
    filteredUrls = _filter(urlsOriginal.value, (url) => {
      return url.category === categoryFilter.value;
    });
  } else {
    // creates new list with no url duplicates and adds all hits for same url
    let urls = _cloneDeep(urlsOriginal.value);
    _forEach(urls, (urlObject) => {
      let url = urlObject.id;
      let dupIndex = _findIndex(filteredUrls, (duplicate) => {
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

  if (!isEmpty(search.value)) {
    // filter by serach
    filteredUrls = _filter(filteredUrls, (url) => {
      let includes =
        (url.title && url.title.toLowerCase().includes(search.value.toLowerCase())) ||
        (url.description && url.description.toLowerCase().includes(search.value.toLowerCase())) ||
        (url.id && url.id.toLowerCase().includes(search.value.toLowerCase())) ||
        (url.hits && url.hits.toString().includes(search.value));
      return includes;
    });
  }

  return _sortBy(filteredUrls, ['hits', 'id']).reverse(); // sort by most hits
}); // urls

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
  let index = _findIndex(urlsOriginal.value, (url) => {
    return url.id === item.id && url.category === item.category;
  });

  let newItem = urlsOriginal.value[index];

  if (newItem.display === item.logo && item.image != item.logo && item.image != null) {
    newItem.display = item.image;
  } else {
    newItem.display = caseLogo;
    newItem.isCaseLogo = true;
  }
  urlsOriginal.value.splice(index, 1, newItem);
} // changeDisplay

/**
 * Set category filter for training urls.
 *
 * @param category - category to filter by
 */
function filterByCategory(category) {
  if (categoryFilter.value == category) {
    categoryFilter.value = 'All';
  } else {
    categoryFilter.value = category;
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
  return value == categoryFilter.value;
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
