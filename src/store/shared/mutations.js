export default {
  setAlertData: (state, payload) => state.alertData = payload,
  resetAlertData: state => state.alertData.isAlert = false,
  setLoading: (state, payload) => state.isLoading = payload
}
