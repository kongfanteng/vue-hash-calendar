import Vue from 'vue'
import App from './App.vue'
import './reset.css';
import vueHashCalendar from '../packages/index'

Vue.use(vueHashCalendar)

Vue.config.productionTip = false


new Vue({
  render: (h) => h(App)
}).$mount('#app')
