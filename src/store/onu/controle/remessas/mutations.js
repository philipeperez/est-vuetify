import Vue from 'vue'

export default {
  setOnusInstaladas: (state, payload) => {
    state.onusInstaladas = payload
  },

  setRemessas: (state, remessas) => state.remessas = remessas,
  setRemessa: (state, payload) => state.remessas[state.indiceRemessaAtiva] = payload,
  addRemessa: (state, payload) => state.remessas.push(payload),
  removeRemessa: (state, payload) => state.remessas.splice(payload),
  shiftRemessa: (state, payload) => state.remessas.splice(payload.index, 1, payload.novaRemessa),
  fecharRemessa: (state, payload) => state.remessas[state.remessas.indexOf(payload)].fechado = true,

  setItensRemessas: (state, payload) => {
    let itens = state.itensRemessas.concat(payload)
    state.itensRemessas = itens
    // const merged = new Set([...state.itensRemessas, ...payload])
    // state.itensRemessas = merged
  },
  setItemLoading: (state, payload) => {
    Vue.set(payload.posicaoAtual, 'carregando', true)
  },

  onItemLoaded: (state, payload) => {
    Vue.set(payload.item, 'posicaoAtual', payload.data)
    Vue.set(payload.item.posicaoAtual, 'carregado', true)
    Vue.set(payload.item.posicaoAtual, 'carregando', false)
  },

  onBuscarPosicaoError: (state, payload) => {
    Vue.set(payload.posicaoAtual, 'carregando', false)
  },

  setOnusUnm: (state, payload) => state.onusUnm = payload,
  setIndiceRemessaAtiva: (state, payload) => state.indiceRemessaAtiva = payload,
  removeItemRemessa: (state, payload) => {//Remover o item também de remessas.itensRemessa
    const numDoc = payload.numDocTransferencia
    const index = state.itensRemessas.findIndex(item => item.numDocTransferencia === numDoc && item.serial.toUpperCase() === payload.serial.toUpperCase())
    const remessa = state.remessas.find(item => item.numeroDocumento === numDoc)
    let itensRemessa = remessa.itensRemessa
    const itemIndex = itensRemessa.indexOf(payload.serial)
    remessa.itensRemessa.splice(itemIndex, 1)
    state.itensRemessas.splice(index, 1)
  },
  setRemessaForm: (state, {key, value}) => state.novaRemessaForm[key].value = value,
  resetRemessaForm: ({novaRemessaForm}) => {
    for (let key in novaRemessaForm) {
      if (key === 'codPosDestino')
        novaRemessaForm[key].value = 'POS01'
      else
        novaRemessaForm[key].value = ''
    }
  },
  setOnusDepCarregadas: (state, payload) => state.onusDepCarregadas = payload,
  resetOnusDepCarregadas: state => state.onusDepCarregadas = {},
  setLoading: (state, payload) => state.isLoading = payload,
  changeObject: (state, {obj, prop, value}) => Vue.set(obj, prop, value),
  setFilteredItems: (state, payload) => state.filteredItems = payload
}
