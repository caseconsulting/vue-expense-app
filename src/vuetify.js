import { createVuetify } from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import TwitterIcon from '@/components/custom-icons/TwitterIcon';
import FacebookIcon from '@/components/custom-icons/FacebookIcon';
import AdpIcon from '@/components/custom-icons/AdpIcon';
import BambooIcon from '@/components/custom-icons/BambooIcon';
import CaseIcon from '@/components/custom-icons/CaseIcon';

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
      adp: {
        component: AdpIcon
      },
      bamboo: {
        component: BambooIcon
      },
      case: {
        component: CaseIcon
      }
    }
  }
};

export default createVuetify(opts);
