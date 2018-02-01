export default {
  getLocalServerAdress: state => state.localServerAdress,
  getAirServerAdress: state => state.airServerAdress,
  getAirHeaders: state => state.airHeaders,
  getUnidades: state => state.unidades,
  getIsLoading: state => state.isLoading,
  getAlertData: state => state.alertData,
  getDepositos: state => state.depositos,
  getPadtecToAlfa: () => (serial) => {
    let num = Number(serial.substr(0, 1))
    let numBin = num.toString(2)
    numBin = '0000'.substr(numBin.length) + numBin

    let week = Number(serial.substr(1, 2))
    let weekBin = week.toString(2)
    weekBin = '000000'.substr(weekBin.length) + weekBin

    let year = Number(serial.substr(3, 2))
    let yearBin = year.toString(2)
    yearBin = '000000'.substr(yearBin.length) + yearBin

    let idBin = numBin + weekBin + yearBin

    let ident1 = idBin.substr(0, 4)
    let ident1Bin2Dec = parseInt(ident1, 2)
    let ident1Dec2Hex = ident1Bin2Dec.toString(16)

    let ident2 = idBin.substr(4, 4)
    let ident2Bin2Dec = parseInt(ident2, 2)
    let ident2Dec2Hex = ident2Bin2Dec.toString(16)

    let ident3 = idBin.substr(8, 4)
    let ident3Bin2Dec = parseInt(ident3, 2)
    let ident3Dec2Hex = ident3Bin2Dec.toString(16)

    let ident4 = idBin.substr(12, 4)
    let ident4Bin2Dec = parseInt(ident4, 2)
    let ident4Dec2Hex = ident4Bin2Dec.toString(16)

    serial = Number(serial.slice(5, 10))
    let serialHex = serial.toString(16)
    serialHex = '0000'.substr(serialHex.length) + serialHex

    let result = ident1Dec2Hex + ident2Dec2Hex + ident3Dec2Hex + ident4Dec2Hex + serialHex

    return 'PDTC' + result
  },

  isOnuInstalled: (state, getters) => (serial) => {
    const onus = getters.getOnusInstaladas
    if(onus.length === 0) return

    let iniciais = serial.substr(0, 4).toUpperCase()
    let itemParaTeste = serial
    const pattern = new RegExp(/^[0-9]/)

    if (iniciais === 'S150')
      itemParaTeste = 'ZYXE' + serial.substr(5, 8).toUpperCase()
    else if (pattern.test(serial))
      itemParaTeste = getters.getPadtecToAlfa(serial).toUpperCase()

    return onus.has(itemParaTeste.toUpperCase())
  },
}
