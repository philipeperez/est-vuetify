import getters from './getters'
import mutations from './mutations'
import actions from './actions'

export default {
  state: {
    itensRemessas: [],
    remessas: [],
    onusUnm: '',
    onusInstaladas: [],
    // indiceRemessaAtiva: '',
    onusDepCarregadas: {},
    filteredItems: '',
    onuGroups: {
      '1LAN': [
        'EST01342',
        'EST00628',
        'EST00629',
        'EST00636',
        'EST01301',
        'EST00635'
      ],

      '1LAN+1FSX': [
        'EST00630'
      ],

      '2LAN': [
        'EST01119'
      ],

      '2LAN+1FSX': [
        'EST00631',
        'EST01546'
      ],

      '4LAN+2FSX': [
        'EST00632'
      ],

      '4LAN+2FSX+WIFI': [
        'EST00633',
        'EST00634'
      ],
    }
  },

  getters,
  mutations,
  actions
}
