import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { fa } from 'vuetify/iconsets/fa';
import { aliases, mdi } from 'vuetify/lib/iconsets/mdi';
// import TwitterIcon from '@/components/custom-icons/TwitterIcon';
// import FacebookIcon from '@/components/custom-icons/FacebookIcon';
// import AdpIcon from '@/components/custom-icons/AdpIcon';
// import BambooIcon from '@/components/custom-icons/BambooIcon';
// import CaseIcon from '@/components/custom-icons/CaseIcon';

const opts = {
  components,
  directives,
  theme: {
    primary: '#68caa6',
    radioactive: '#0ACF23'
  },
  icons: {
    defaultSet: 'mdi',
    iconfont: 'fa',
    aliases,
    sets: {
      mdi,
      fa
    }
  }
};

export default createVuetify(opts);
