import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import TwitterIcon from '@/components/custom-icons/TwitterIcon';
import FacebookIcon from '@/components/custom-icons/FacebookIcon';
import BasecampIcon from '@/components/custom-icons/BasecampIcon';

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
      },
      basecamp: {
        component: BasecampIcon
      }
    }
  }
};

export default new Vuetify(opts);
