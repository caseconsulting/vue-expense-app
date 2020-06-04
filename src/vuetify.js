import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

const opts = {
  theme: {
    primary: '#68caa6',
    radioactive: '#0ACF23'
  },
  icons: {
    iconfont: 'md'
  }
};

export default new Vuetify(opts);
