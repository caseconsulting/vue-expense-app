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

      <br />
      <br />

      <hr />
      <br />
      <!-- <v-card :outlined="true">
        <div class="container">
          <div class="row">
            <div class="col-sm">
              <img class="url-image" src="../assets/img/logo-big.png" aspect-ratio="2.75" />
            </div>
            <div class="col-sm">
              <p>alksjdaljd</p>
            </div>
          </div>
        </div>
      </v-card> -->
      <p v-for="url in this.urls" :key="url.id">
        <v-flex xs12 sm8 offset-sm2>
          <v-card>
            <v-layout>
              <v-flex xs4>
                <img class="url-image" src="../assets/img/logo-big.png" />
              </v-flex>
              <v-flex>
                <v-card-title primary-title>
                  <div>
                    <a style="font-size: 20px;" :href="url.id" target="_blank">{{ url.id }}</a>
                    <div>Hits: {{ url.hits }}</div>
                  </div>
                </v-card-title>
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </p>

      <!-- <p v-for="url in this.urls">
        <v-flex xs12 sm6 offset-sm3>
          <v-card :outlined="true">
            <v-img src="https://cdn.vuetifyjs.com/images/cards/desert.jpg" aspect-ratio="2.75"></v-img>
            <v-card-title primary-title>
              <h3>{{ url.id }}</h3>
              <h3>Hits: {{ url.hits }}</h3>
            </v-card-title>
          </v-card>
        </v-flex>
      </p> -->
    </div>
  </v-container>
</template>
<script>
import api from '@/shared/api.js';
// import { getItems } from '@/utils/auth';
// import _ from 'lodash';

async function getUrls() {
  this.urls = await api.getItems(api.URLS);
}

function getUrl() {
  // getUrls();
  // getUrls().then(urls => {
  //   console.log('len', urls);
  //   let x = 0;
  //   // for (u in urls) {
  //   //   x++;
  //   //   console.log('hi', x);
  //   //   console.log(u);
  //   // }
  //   console.log('hi', x);
  //   return console.log('done');
  // });
}

export default {
  data() {
    return {
      urls: [],
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
  },
  mounted() {
    this.getUrls();
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
  padding-bottom: 100px !important;
  padding-left: 60px !important;
  padding-right: 60px !important;
}

.trend-icon {
  font-size: 80px !important;
}

/* Cards for the URL Posts */

.url-card {
  padding: 10px;
}

.url-image {
  max-width: 250px;
  max-height: 250px;
}

.url-info {
  display: inline;
  border: 2px solid black;
  min-width: 100%;
  min-height: 100%;
}
</style>
