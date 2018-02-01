import Vue from 'vue'
import Vuex from 'vuex'
import controleRemessas from './onu/controle/remessas'
import shared from './shared'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  modules: {
    controleRemessas,
    shared
  }
})
