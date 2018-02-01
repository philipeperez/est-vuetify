import axios from 'axios'
import * as firebase from 'firebase'

export default {
  getRemessasFromFirebase: ({commit, dispatch}) => {
    return new Promise((resolve, reject) => {
      const db = firebase.database().ref('remessas')
      const query = db.orderByChild('fechado').equalTo(false)
      let remessasArr = []

      query.once('value').then(snap => {
        const items = Object.keys(snap.val()).map(Number)
        commit('setFilteredItems', items)

        let remessas = snap.val()

        for (let key in remessas) {
          let remessa = remessas[key]
          remessa.itensRemessa = Object.keys(remessa.itensRemessa)
          Object.defineProperty(remessa, 'qtdEquipamentosAtual', {
            get: function () {
              return this.itensRemessa.length
            }
          })
          remessasArr.push(remessa)
        }
        commit('setRemessas', remessasArr)
        dispatch('calcPercInstalada', remessasArr).then(rems => {
          commit('setRemessas', rems)
          dispatch('onRemessaAdded')
          dispatch('onRemessaRemoved')
          resolve()
        })
      })
        .catch(err => {
          reject(err)
        })
    })
  },

  sequentialGet: async ({dispatch}, payload) => {
    for(let i = 0; i < payload.length; i++) {
      if(!payload[i].posicaoAtual.carregado && !payload[i].posicaoAtual.carregando) {
        await dispatch('getOnuPosition', payload[i])
      }
    }
  },

  onRemessaAdded: ({commit, dispatch, getters}) => {
    const db = firebase.database().ref()
    const remessasRef = db.child('remessas')
    const query = remessasRef.orderByChild('fechado').equalTo(false)
    const remessas = getters.getRemessas

    query.on('child_added', snap => {
      if (remessas.indexOf(remessas.find(el => el.numeroDocumento == snap.key)) < 0) {
        const keyArr = Object.keys(snap.val().itensRemessa)
        let remessa = snap.val()
        remessa.itensRemessa = keyArr
        dispatch('calcPercInstalada', remessa).then(resp => commit('addRemessa', resp))
      }
    })
  },

  onRemessaRemoved: ({commit, getters}) => {
    const db = firebase.database().ref()
    const remessasRef = db.child('remessas')
    const query = remessasRef.orderByChild('fechado').equalTo(false)

    query.on('child_removed', snap => {
      const remessas = getters.getRemessas
      const index = remessas.findIndex(el => el.numeroDocumento == snap.key)
      commit('removeRemessa', index)
    })
  },

  getItensRemessaFromFirebase: ({commit, getters, dispatch}, payload) => {
    return new Promise(resolve => {
      dispatch('firebaseGetOnce', `itens_remessas/${payload}`)
        .then(snap => {
          let dados = Object.values(snap.val())
          dados.forEach(item => {
            item.posicaoAtual = {}
            item.posicaoAtual.carregando = false
            item.posicaoAtual.carregado = false
            item.instalada = getters.isOnuInstalled(item.serial)
          })
          commit('setItensRemessas', dados)
          dispatch('onItemRemessaRemoved', payload)
          resolve()
        })
        .catch(err => console.log(err))
    })
  },

  onItemRemessaRemoved: ({commit}, payload) => {
    firebase.database().ref(`itens_remessas/${payload}`).on('child_removed', snap => {
      const item = snap.val()
      commit('removeItemRemessa', item)
    })
  },

  removeItemRemessaFromFb: ({dispatch}, payload) => {
    return new Promise((resolve, reject) => {
      const dados = {
        [`itens_remessas/${payload.numDocTransferencia}/${payload.serial}`]: null,
        [`remessas/${payload.numDocTransferencia}/itensRemessa/${payload.serial}`]: null,
      }
      dispatch('firebaseUpdate', dados)
        .then(() => {
          dispatch('setSuccessAlert', `Item patrimônio ${payload.patrimonio} removido com sucesso`)
          resolve()
        })
        .catch(err => {
          console.log(err)
          dispatch('setErrorAlert', `Ops! Não foi possível remover o item patrimônio ${payload.patrimonio}`)
          reject(err)
        })
    })

  },

  calcPercInstalada: ({getters}, payload) => {
    const calc = function (remessa) {
      remessa.color = {}
      Object.defineProperties(remessa, {
        'qtdOnusInstaladas': {
          get: function () {
            let instaladas = 0
            let itensRemessa = remessa.itensRemessa
            itensRemessa.forEach(item => {
              if (getters.isOnuInstalled(item)) instaladas++
            })
            return instaladas
          }
        },

        'percInstalada': {
          get: function () {
            let perc = this.qtdOnusInstaladas / this.itensRemessa.length
            perc = Math.ceil(perc * 100)
            return perc
          }
        },

        'dias': {
          get: function () {
            return Math.round(Math.abs((this.data - new Date().getTime()) / (24 * 60 * 60 * 1000)))
          }
        }
      })
      Object.defineProperties(remessa.color, {
        'red': {
          get: function () {
            return remessa.percInstalada > 50 ? Math.round(255 - ((255 / 50) * (remessa.percInstalada - 50))) : 255
          }
        },
        'green': {
          get: function () {
            return remessa.percInstalada < 51 ? Math.round((255 / 50) * remessa.percInstalada) : 255
          }
        }
      })
    }

    return new Promise((resolve) => {
      if (Array.isArray(payload)) {
        payload.forEach(remessa => {
          calc(remessa)
        })
      } else {
        calc(payload)
      }
      resolve(payload)
    })
  },

  saveRemessaToFirebase: ({getters, dispatch}, payload) => {
    return new Promise((resolve, reject) => {
      const dataArr = payload.data.split('-')
      const equipamentos = payload.patrimonios.trim().split('\n')
      delete payload.patrimonios
      delete payload.dataFormatada
      const tempoEspera = 200
      let multiplicador = -1

      let remessaPayload = {
        path: `remessas/${payload.numeroDocumento}`,
        value: {}
      }

      let itensPayload = {
        path: `itens_remessas/${payload.numeroDocumento}`,
        value: {}
      }

      payload.itensRemessa = {}
      payload.data = new Date(dataArr[0], dataArr[1] - 1, dataArr[2]).getTime()

      equipamentos.forEach(el => {
        let onuObj = getters.getOnusDepCarregadas[el]
        if (onuObj !== undefined) {
          payload.itensRemessa[onuObj.patrimonio.toUpperCase()] = true
          itensPayload.value[onuObj.patrimonio.toUpperCase()] = {
            patrimonio: onuObj.serial,
            serial: onuObj.patrimonio,
            mac: onuObj.mac,
            codItem: onuObj.item_codigo,
            descricao: onuObj.item_nome,
            numDocTransferencia: payload.numeroDocumento
          }

          const serialArray = Object.keys(payload.itensRemessa)
          if (serialArray.length === equipamentos.length) {
            remessaPayload.value = payload
            dispatch('firebaseSet', remessaPayload)
              .then(() => {
                dispatch('firebaseSet', itensPayload)
                  .then(() => resolve('Remessa cadastrada com sucesso!'))
                  .catch(err => reject(err))
              })
              .catch(err => reject(err))
          }
        } else {
          multiplicador++
          getters.delayedGet(`${getters.getAirServerAdress}/deposito/find_by_serial/${el}`, tempoEspera * multiplicador, ({data}) => {
            payload.itensRemessa[data.numero_patrimonio.toUpperCase()] = true
            itensPayload.value[data.numero_patrimonio.toUpperCase()] = {
              patrimonio: data.numero_serial,
              serial: data.numero_patrimonio,
              mac: data.numero_mac,
              codItem: data.item_codigo,
              descricao: data.item_nome,
              numDocTransferencia: payload.numeroDocumento
            }

            const serialArray = Object.keys(payload.itensRemessa)
            if (serialArray.length === equipamentos.length) {
              remessaPayload.value = payload
              dispatch('firebaseSet', remessaPayload)
                .then(() => {
                  dispatch('firebaseSet', itensPayload)
                    .then(() => resolve('Remessa cadastrada com sucesso!'))
                    .catch(err => reject(err))
                })
                .catch(err => reject(err))
            }
          }, err => {
            reject(err)
          })
        }
      })
    })
  },

  getOnuList: ({dispatch, getters, commit}) => {
    return new Promise((resolve, reject) => {
      axios.get(`${getters.getLocalServerAdress}/unm/onus/list`)
        .then(({data}) => {
          let onuList = new Set(data)
          // console.log(new Set(data))
          commit('setOnusInstaladas', onuList)
          resolve()
        })
        .catch(err => {
          console.log(err)
          dispatch('setErrorAlert', err)
          reject(err)
        })
    })
  },

  getOnuPosition: ({commit, getters, dispatch}, payload) => {
    return new Promise((resolve, reject) => {
      commit('setItemLoading', payload)
      const url = `${getters.getAirServerAdress}/deposito/find_by_serial/${payload.patrimonio}`
      axios.get(url, getters.getAirHeaders)
        .then(({data}) => {
          const dados = {
            item: payload,
            data
          }
          commit('onItemLoaded', dados)
          resolve()
        })
        .catch(err => {
          console.log(err)
          commit('onBuscarPosicaoError', payload)
          dispatch('setErrorAlert', 'Erro! Não foi possível buscar a posição do item.')
          reject()
        })
    })

  },

  getOnusUnmForFb: ({dispatch, getters, commit}) => {
    axios.get(`${getters.getLocalServerAdress}/unm/onus`)
      .then(({data}) => {
        let onusUnm = {}

        data.forEach(onu => {
          if (onusUnm[onu.serial.toUpperCase()] === undefined)
            onusUnm[onu.serial.toUpperCase()] = onu
        })
        onusUnm = Object.keys(onusUnm)
        commit('setOnusUnm', onusUnm)
      })
      .catch(err => {
        console.log(err)
        dispatch('setErrorAlert', err)
      })
  },

  getRemessasFromServer: ({commit, dispatch, getters}) => {
    axios.get(`${getters.getLocalServerAdress}/remessas`)
      .then(({data}) => {
        commit('setRemessas', data)
        const remessasAbertas = getters.getRemessasAbertas
        const documentos = remessasAbertas.map(item => item.numeroDocumento)
        dispatch('setFilteredItems', documentos)
      })
      .catch(err => {
        console.log(err)
        dispatch('setErrorAlert', 'Ops! Ocorreu um erro no servidor!')
      })

    dispatch('getOnusUnm')
  },

  getOnusUnm: ({dispatch, getters, commit}) => {
    axios.get(`${getters.getLocalServerAdress}/unm/onus`)
      .then(({data}) => {
        let onusUnm = {}

        data.forEach(onu => {
          if (onusUnm[onu.serial.toUpperCase()] === undefined)
            onusUnm[onu.serial.toUpperCase()] = onu
        })
        // onusUnm = Object.keys(onusUnm)
        commit('setOnusUnm', onusUnm)
        let copiaRemessas = getters.getRemessas.slice()//JSON.parse(JSON.stringify(getters.getRemessas))
        dispatch('carregarItens', copiaRemessas)
      })
      .catch(err => {
        console.log(err)
        dispatch('setErrorAlert', err)
      })
  },

  carregarItens: (context, payload) => {
    payload.forEach(remessa => {
      let instaladas = 0
      let naoInstaladas
      remessa.nomeDeposito = context.getters.getDepositos[remessa.codDepDestino]
      remessa.dias = Math.round(Math.abs((new Date(remessa.data).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)))
      remessa.itensRemessa.forEach(item => {
        item.posicaoAtual = {
          cliente_nome: '',
          deposito_codigo: '',
          deposito_nome: '',
          deposito_tipo: '',
          deposito_unidade: '',
          item_codigo: '',
          item_nome: '',
          numero_chip_id: '',
          numero_mac: '',
          numero_patrimonio: '',
          numero_serial: '',
          posicao_codigo: '',
          posicao_nome: '',
          carregando: false,
          carregado: false
        }

        let itemSerial = item.serial.toUpperCase()
        let codItem = item.codItem

        if (codItem === 'EST01301')
          itemSerial = 'ZYXE' + itemSerial.substr(5, 8)
        else if (codItem === 'EST00636')
          itemSerial = context.getters.getPadtecToAlfa(itemSerial).toUpperCase()

        let onuUnm = context.getters.getOnusUnm[itemSerial]

        if (onuUnm !== undefined) {
          item.cliente = onuUnm.name
          item.label = 'primary'
          instaladas++
        } else {
          item.cliente = 'Não instalada!'
          item.label = 'warning'
        }
      })

      naoInstaladas = remessa.itensRemessa.length - instaladas
      instaladas = instaladas / remessa.itensRemessa.length
      naoInstaladas = naoInstaladas / remessa.itensRemessa.length

      instaladas = Math.ceil(instaladas * 100)
      naoInstaladas = Math.floor(naoInstaladas * 100)

      remessa.percInstalada = instaladas
      remessa.percNaoInstalada = naoInstaladas
      remessa.color = {}

      remessa.color.red = instaladas > 50 ? Math.round(255 - ((255 / 50) * (instaladas - 50))) : 255
      remessa.color.green = instaladas < 51 ? Math.round((255 / 50) * instaladas) : 255
    })

    context.commit('setRemessas', payload)
  },
  setFilteredItems: ({commit}, payload) => commit('setFilteredItems', payload),
  setRemessas: ({commit}, payload) => commit('setRemessas', payload),
  setRemessa: ({commit}, payload) => commit('setRemessa', payload),
  setOnusUnm: ({commit}, payload) => commit('setOnusUnm', payload),
  setIndiceRemessaAtiva: ({commit}, payload) => commit('setIndiceRemessaAtiva', payload),
  removeItemRemessa: ({commit, getters}, payload) => {
    const remessa = getters.getRemessa(payload.numDocTransferencia)
    let obj = {}

    obj.indexRemessa = getters.getRemessas.indexOf(remessa)
    obj.indexItem = remessa.itensRemessa.indexOf(payload)
    commit('removeItemRemessa', obj)
  },
  setRemessaForm: ({commit}, payload) => commit('setRemessaForm', payload),
  fecharRemessa: ({commit, getters}, payload) => {
    const remessa = getters.getRemessa(payload)
    commit('fecharRemessa', remessa)
  },
  resetRemessaForm: ({commit}) => commit('resetRemessaForm'),
  setOnusDepCarregadas: ({commit}, payload) => commit('setOnusDepCarregadas', payload),
  resetOnusDepCarregadas: ({commit}) => commit('resetOnusDepCarregadas'),
  setLoading: ({commit}, payload) => commit('setLoading', payload),
  changeObject: ({commit}, payload) => commit('changeObject', payload)
}
