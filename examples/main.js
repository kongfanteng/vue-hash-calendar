import Vue from 'vue';
import App from './App.vue';
import './reset.css';
import MrCalendarCenter from '../packages/index';

Vue.use(MrCalendarCenter);

Vue.config.productionTip = false;

new Vue({
    render: h => h(App)
}).$mount('#app');
