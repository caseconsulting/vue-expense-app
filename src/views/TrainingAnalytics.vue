<template>
  <v-container>
    <div>
      <h1 style="text-align:center">Trending</h1>
    </div>

    <br />
    <br />
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
      <p>
        {{ getUrl() }}
      </p>

      <br />
      <br />

      <hr />
    </div>
  </v-container>
</template>
<script>
import api from '@/shared/api.js';
// import { getItems } from '@/utils/auth';
// import _ from 'lodash';

async function getUrls() {
  let urls = await api.getItems(api.URLS);
  console.log(urls);
  return urls;
}

function getUrl() {
  let urls = getUrls();
  console.log('len', urls);
  let x = 0;
  // for (u in urls) {
  //   x++;
  //   console.log('hi', x);
  //   console.log(u);
  // }
  console.log('hi', x);
  return console.log('done');
}

export default {
  data() {
    return {
      urlInfo: {
        id: ' ',
        category: '',
        hits: 0
      }
    };
  },
  methods: {
    getUrls,
    getUrl
  }
};
</script>
<style>
.t {
  font-size: 80px;
}

.trend-bubble {
  padding-top: 20px !important;
  padding-bottom: 100px !important;
  padding-left: 60px !important;
  padding-right: 60px !important;
}

.trend-icon {
  font-size: 80px !important;
}
</style>
