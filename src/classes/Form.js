export default class Form {
  _rules = {}
  constructor(obj) {
    this.originalData = obj

    for(let key in obj) {
      this[key] = obj[key]
    }
    delete this.originalData.rules
  }

  reset() {
    for(let key in this.originalData) {
      this[key] = ''
    }
  }

  submit(type, databaseRef) {
    let types = ['update', 'set', 'push']
    if(types.indexOf(type) < 0) throw new Error(`O tipo ${type} não é aceito.`)
    let obj = {}
    for(let key in this.originalData) {
      obj[key] = this[key]
    }
    databaseRef[type](obj)
  }

  set rules(value) {
    if(typeof value !== 'object') throw new Error('A propriedade "rules" deve ser um objeto.')
    this._rules = value
  }

  get rules() {
    return this._rules
  }

  addRule(key, rule) {
    if(!this.hasOwnProperty(key)) throw new Error(`Campo ${key} inexistente`)
    if(this.rules[key] !== undefined)
      this.rules[key].push(rule)
    else {
      this.rules[key] = []
      this.addRule(key, rule)
    }
  }

  get isValid() {

    let arr = []

    const rules = this._rules
    const form = this.originalData

    if(rules === {}) return true

    for (let key in form) {
      if (rules.hasOwnProperty(key)) {
        rules[key].forEach(item => arr.push(item(form[key])))
      }
    }

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== true)
        return false
    }
    return true
  }

  set isValid(value) {

  }
}
