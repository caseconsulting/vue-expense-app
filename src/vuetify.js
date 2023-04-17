import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import TwitterIcon from '@/components/custom-icons/TwitterIcon';
import FacebookIcon from '@/components/custom-icons/FacebookIcon';

Vue.use(Vuetify);

const opts = {
  theme: {
    primary: '#68caa6',
    radioactive: '#0ACF23'
  },
  icons: {
    iconfont: 'mdi',
    values: {
      twitter: {
        component: TwitterIcon
      },
      facebook: {
        component: FacebookIcon
      }
    }
  }
};

export default new Vuetify(opts);
