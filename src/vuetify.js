import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { aliases, mdi } from 'vuetify/lib/iconsets/mdi';
import { isSame } from './shared/dateUtils';
import DayJsAdapter from '@date-io/dayjs';
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
    aliases,
    sets: {
      mdi,
      fa
    }
  }
};

export default createVuetify(opts);
