import AdpIcon from '@/components/custom-icons/AdpIcon';
import BambooIcon from '@/components/custom-icons/BambooIcon';
import CaseIcon from '@/components/custom-icons/CaseIcon';
import FacebookIcon from '@/components/custom-icons/FacebookIcon';
import TwitterIcon from '@/components/custom-icons/XIcon';
import DayJsAdapter from '@date-io/dayjs';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import 'vuetify/styles';
import GithubIcon from './components/custom-icons/GithubIcon.vue';
import LinkedinIcon from './components/custom-icons/LinkedinIcon.vue';
import { isSame } from './shared/dateUtils';
const adapter = new DayJsAdapter();

// the library does not include these functions so manually set it to avoid date picker errors
adapter.getNextYear = (date) => {
  return date.add(1, 'year');
};
adapter.isSame = (date1, date2) => {
  return isSame(date1, date2);
};
adapter.isSameDay = (date1, date2) => {
  return isSame(date1, date2, 'day');
};

const opts = {
  components,
  date: {
    adapter
  },
  directives,
  theme: {
    primary: '#68caa6',
    radioactive: '#0ACF23'
  },
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      twitter: TwitterIcon,
      facebook: FacebookIcon,
      adp: AdpIcon,
      bamboo: BambooIcon,
      case: CaseIcon,
      github: GithubIcon,
      linkedin: LinkedinIcon
    },
    sets: {
      mdi
    }
  }
};

export default createVuetify(opts);
