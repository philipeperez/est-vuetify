import axios from 'axios'

export default {
  getOnusInstaladas: state => state.onusInstaladas,
  getOnusDepCarregadas: state => state.onusDepCarregadas,
  getRemessas: state => state.remessas,
  // getOnusUnm: state => state.onusUnm,
  getRemessa: state => numDoc => state.remessas.find(item => item.numeroDocumento == numDoc),
  getItensRemessas: state => state.itensRemessas,
  getItensRemessa: state => numDoc => state.itensRemessas.filter(item => item.numDocTransferencia === numDoc),
  // getRemessasAbertas: state => state.remessas.filter(remessa => !remessa.fechado),
  delayedGet: (state, getters) => (url, msWait, caseSuccessFunc, caseErrFunc) => {
    setTimeout(() => {
      axios.get(url, getters.getAirHeaders)
        .then(caseSuccessFunc)
        .catch(caseErrFunc)
    }, msWait)
  },
  getFilteredItems: state => state.filteredItems,
  getOnuGroups: state => state.onuGroups
}
