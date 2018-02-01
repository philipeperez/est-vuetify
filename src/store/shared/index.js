import getters from './getters'
import mutations from './mutations'
import actions from './actions'

export default {
  state: {
    localServerAdress: 'http://192.168.1.98:8080',
    airServerAdress: 'https://api.sumicity.net.br:7010',
    airHeaders: {
      headers: {
        token: 'VVNSMDA3MA=='
      }
    },
    unidades: [
      "TER",
      "INF",
      "CTR",
      "STA",
      "ALP",
      "SPA",
      "BNS",
      "CBF",
      "SPC",
      "CYD",
      "GUA",
      "ITPV",
      "TRS",
      "NFO",
      "CMC",
      "SJV",
      "SDP",
      "PDS",
      "CMO",
      "NSI",
      "JMPR",
      "BOS",
      "MCE",
      "PIBT",
      "LEO",
      "ITA",
      "NIT",
      "ARL",
      "RIOS",
      "SIU"
    ],
    alertData: {
      isAlert: false,
      color: null,
      icon: null,
      text: ''
    },
    isLoading: false,
    depositos: {
      '01.002': 'Além Paraíba',
      '01.003': 'Nova Friburgo',
      '01.004': 'Rio das Ostras',
      '01.005': 'Teresópolis',
      '01.006': 'Guapimirim',
      '01.007': 'Santo Aleixo',
      '01.008': 'Três Rios',
      '01.009': 'Sumidouro',
      '01.011': 'Macaé',
      '01.012': 'Piabetá',
      '01.014': 'São Pedro da Aldeia',
      '01.015': 'Cabo Frio'
    }
  },

  getters,
  mutations,
  actions
}
