// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import Vuetify from 'vuetify'

import App from './App'
import router from './router'
import store from './store'
import * as firebase from 'firebase'

import DateFilter from './filters/date'
import DateTimeFilter from './filters/dateTime'

import Alerts from './components/shared/AlertToast.vue'
import RemessaDataTable from './components/onu/controle/RemessaDataTableFirebase.vue'
import BarChart from './charts/Bar'
import LineChart from './charts/Line'

Vue.use(Vuetify)
Vue.component('est-alert-toast', Alerts)
Vue.component('est-remessa-data-table', RemessaDataTable)
Vue.component('bar-chart', BarChart)
Vue.component('line-chart', LineChart)
Vue.filter('date', DateFilter)
Vue.filter('dateTime', DateTimeFilter)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  created() {
    firebase.initializeApp({
      apiKey: "AIzaSyCgJWBHVTlRTI_2uEr0rw4ba1rhdL5-OAs",
      authDomain: "estoque-sumicity.firebaseapp.com",
      databaseURL: "https://estoque-sumicity.firebaseio.com",
      projectId: "estoque-sumicity",
      storageBucket: "estoque-sumicity.appspot.com",
      messagingSenderId: "202641604097"
    })
  }
})
