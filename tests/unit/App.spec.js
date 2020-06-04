import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';

describe('App.vue', () => {
  it('displays app name', () => {
    const msg = '€xpense App';
    const wrapper = shallowMount(App);
    expect(wrapper.text()).toMatch(msg);
  });
});
