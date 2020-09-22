// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App';
import router from './router';
import store from './store';
import Toaster from 'v-toaster';
import VueLodash from 'vue-lodash';
import VeeValidate from 'vee-validate';
import VuejsDialog from 'vuejs-dialog';
import Vue2Filters from 'vue2-filters';
import VCalendar from 'v-calendar';
import 'v-calendar/lib/v-calendar.min.css';
import lineClamp from 'vue-line-clamp';
import VueI18n from 'vue-i18n';
import viMessage from './lang/vi.json';
import enMessage from './lang/en.json';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import VueNativeSock from 'vue-native-websocket';
import API_CONFIG from '@/api-config';
import JsonExcel from 'vue-json-excel';
import CamLiveImg from '@/components/CamLiveImg';
import Warning from '@/views/Warning';
import MarqueeText from 'vue-marquee-text-component';

import VueCookies from 'vue-cookies';
Vue.use(VueCookies);
Vue.component('marquee-text', MarqueeText);
Vue.component('cam-live-img', CamLiveImg);
Vue.component('warning', Warning);
Vue.component('VueCtkDateTimePicker', VueCtkDateTimePicker);
Vue.use(
    VueNativeSock,
    API_CONFIG.WEBSOCKET_URL.includes('://')
        ? API_CONFIG.WEBSOCKET_URL
        : `${location.origin.replace('http', 'ws')}${API_CONFIG.WEBSOCKET_URL}`, {
        store: store,
        format: 'json',
        reconnection: true
    }
);

// Filters
import { formatDatetime, format12Hours, formatDate } from './filters/datetime';

// Components
import { SubHeader, RPagination } from '@/components';
import VueKonva from 'vue-konva';

Vue.use(VueKonva);
Vue.use(BootstrapVue);
Vue.use(Toaster, { timeout: 3000 });
Vue.use(VeeValidate, { fieldsBagName: 'veeFields' });
Vue.use(require('vue-moment'));
Vue.use(VuejsDialog);

const options = { name: '_' };
Vue.use(VueLodash, options);

Vue.use(Vue2Filters);

Vue.use(VCalendar, {
    firstDayOfWeek: 2, // Monday
    formats: {
        title: 'MMMM YYYY',
        weekdays: 'W',
        navMonths: 'MMM',
        input: ['DD/MM/YYYY', 'DD-MM-YYYY'],
        dayPopover: 'L'
    }
});
Vue.use(lineClamp);

Vue.use(VueI18n);

const messages = {
    vi: viMessage,
    en: enMessage
};
export const i18n = new VueI18n({
    locale: 'vi', // set locale
    messages,
    fallbackLocale: 'vi'
});

Vue.component('v-select', vSelect);
Vue.component('downloadExcel', JsonExcel);

// Filters
Vue.filter('formatDateTime', formatDatetime);
Vue.filter('formatDate', formatDate);
Vue.filter('format12Hours', format12Hours);

// Components
Vue.component('sub-header', SubHeader);
Vue.component('r-pagination', RPagination);

/* eslint-disable no-new */

fetch('/static/config/config.json').then(res => res.json()).then(config => {
    new Vue({
        el: '#app',
        i18n,
        router,
        store,
        template: '<App/>',
        data() {
            store.commit('config/SET_CONFIG', config);
            document.title = config.title;
            return config;
        },
        components: {
            App
        }
    });
});

window._ = require('lodash');
