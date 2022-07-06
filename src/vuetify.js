import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify);

const opts = {
  theme: {
    primary: '#68caa6',
    radioactive: '#0ACF23'
  },
  icons: {
    iconfont: 'mdi'
  }
};

export default new Vuetify(opts);
