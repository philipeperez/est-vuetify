import * as firebase from 'firebase'

export default {
  firebaseSet: ({}, {path, value}) => {
    return new Promise((resolve, reject) => {
      firebase.database().ref(path).set(value)
        .then(() => resolve())
        .catch(err => reject(err))
    })
  },

  firebasePush: ({}, {path, value}) => {
    return new Promise((resolve, reject) => {
      firebase.database().ref(path).push(value)
        .then(snap => resolve(snap))
        .catch(err => reject(err))
    })
  },

  firebaseUpdate: ({}, payload) => {
    return new Promise((resolve, reject) => {
      firebase.database().ref().update(payload)
        .then(() => resolve())
        .catch(err => reject(err))
    })
  },

  firebaseRemove: ({}, {path}) => {
    return new Promise((resolve, reject) => {
      firebase.database().ref(path).remove()
        .then(() => resolve())
        .catch(err => reject(err))
    })
  },

  firebaseGetOnce: ({}, path) => {
    return new Promise((resolve, reject) => {
      firebase.database().ref(path).once('value')
        .then(snap => resolve(snap))
        .catch(err => reject(err))
    })
  },

  setSuccessAlert: ({commit}, payload) => {
    const alertData = {
      isAlert: true,
      color: 'success',
      icon: 'check_circle',
      text: payload
    }

    commit('setAlertData', alertData)
    setTimeout(() => {
      commit('resetAlertData')
    }, 6000)
  },

  setInfoAlert: ({commit}, payload) => {
    const alertData = {
      isAlert: true,
      color: 'info',
      icon: 'info',
      text: payload
    }

    commit('setAlertData', alertData)
    setTimeout(() => {
      commit('resetAlertData')
    }, 6000)
  },

  setWarningAlert: ({commit}, payload) => {
    const alertData = {
      isAlert: true,
      color: 'warning',
      icon: 'priority_high',
      text: payload
    }

    commit('setAlertData', alertData)
    setTimeout(() => {
      commit('resetAlertData')
    }, 6000)
  },

  setErrorAlert: ({commit}, payload) => {
    const alertData = {
      isAlert: true,
      color: 'error',
      icon: 'warning',
      text: payload
    }

    commit('setAlertData', alertData)
    setTimeout(() => {
      commit('resetAlertData')
    }, 6000)
  },

  clearAlert({commit}) {
    commit('resetAlertData')
  },

  setLoading({commit}, payload) {
    commit('setLoading', payload)
  }
}
