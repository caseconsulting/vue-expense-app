import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

const opts = {
  customVariables: ['~/styles/variables.scss'],
  treeShake: true,
  theme: {
    themes: {
      light: {
        primary: '#bc3825',
        secondary: {
          darken1: '#3f3f3c',
          base: '#565651',
          lighten1: '#cccccc'
        },
        background: {
          base: '#f5f5f5',
          lighten1: '#ffffff'
        },
        anchor: '#8c9eff'
      },
      dark: {
        primary: '#bc3825',
        secondary: {
          base: '#4a4a4a'
        },
        background: {
          base: '#272727',
          lighten1: '#3f3f3c'
        }
        // primary: colors.green.base,
        // secondary: colors.cyan.base,
        // accent: colors.blue.base,
        // error: colors.yellow.base,
        // warning: colors.amber.base,
        // info: colors.indigo.base
      }
    },
    options: { customProperties: true, variations: true }
  },
  icons: {
    iconfont: 'md'
  }
};

export default new Vuetify(opts);
