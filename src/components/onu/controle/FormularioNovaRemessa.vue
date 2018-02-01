<template>
  <v-dialog v-model="dialog" persistent max-width="500px">
    <v-card color="grey lighten-4" flat>
      <div>
        <v-btn
          @click.native="fechar"
          small
          class="right"
          fab color="error"
          dark>
          <v-icon>clear</v-icon>
        </v-btn>
      </div>
      <v-card-title>
        <span class="headline">Cadastro de Remessa</span>
      </v-card-title>
      <v-card-text>
        <v-layout>
          <v-flex xs12>
            <v-form ref="form" lazy-validation>
              <fieldset style="border: none" :disabled="enviando">
                <v-select
                  overflow
                  required
                  label="Código Dep. Destino"
                  autocomplete
                  :rules="rules.codDepDestino"
                  v-model="form.codDepDestino"
                  :items="deps"></v-select>

                <v-text-field
                  box
                  required
                  label="Número do Documento"
                  hint="Insira o número do documento do SAP"
                  v-model="form.numeroDocumento"
                  :rules="rules.numeroDocumento"></v-text-field>

                <v-menu
                  lazy
                  v-model="datePicker"
                  transition="scale-transition"
                  offset-y
                  full-width
                  :nudge-right="40"
                  max-width="290px"
                  min-width="290px"
                  :disabled="enviando">
                  <v-text-field
                    mask="##/##/####"
                    @focus="datePicker = true"
                    box
                    required
                    :rules="rules.data"
                    slot="activator"
                    label="Data da Remessa"
                    v-model="form.dataFormatada"
                    prepend-icon="event"
                    ></v-text-field>
                  <v-date-picker
                    :title-date-format="{year: 'numeric', month: '2-digit', day: '2-digit'}"
                    locale="pt-br"
                    v-model="form.data"
                    scrollable></v-date-picker>
                </v-menu>
                <v-text-field
                  box
                  :rows="7"
                  required
                  label="Patrimônios"
                  hint="Insira os patrimônios da remessa"
                  multiLine
                  v-model="form.patrimonios"
                  :rules="rules.patrimonios"></v-text-field>
              </fieldset>
            </v-form>
          </v-flex>
        </v-layout>
        <v-subheader v-if="form.patrimonios">Total: {{ form.qtdEquipamentos }} equipamento(s)</v-subheader>
        <small class="error--text">*Todos os campos são obrigatórios</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" flat @click.native="limpar">Limpar Campos</v-btn>
        <v-btn color="error" flat @click.native="fechar">Fechar</v-btn>
        <v-btn
          color="blue darken-1"
          :loading="enviando"
          flat
          @click.native="enviar">Enviar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import lodash from 'lodash'

  export default {
    data() {
      return {
//        valid: true,
        rules: {
          numeroDocumento: [
            (v) => !!v || 'Insira o número do documento',
            (v) => /[0-9]/.test(v) || 'Número de documento inválido'
          ],

          codDepDestino: [
            (v) => !!v || 'Insira o códgo do depósito de destino',
            (v) => /01.0[0-9]{2}/.test(v) || 'O código de depósito inserido é inválido'
          ],

          data: [
            (v) => !!v || 'Insira uma data válida'
          ],

          patrimonios: [
            (v) => !!v || 'Insira os patrimônios da remessa',
            (v) => /^\d[\d\n]+\d$/m.test(v) || 'Insira patrimônios válidos',
            (v) => {
              const arr = v.split('\n')
              const set = new Set(arr)
              arr.sort()
              const duplicados = arr.filter((currentValue, index, array) => {
                if(index > 0)
                  return currentValue === array[index - 1]
                return false
              })
              return arr.length === set.size || `Patrimônios duplicados encontrados: ${duplicados.join(' - ')}`
            }
          ],
        },
        datePicker: false,
        formLoading: false,
        enviando: false,
        codOnus: [
          "EST01342",
          "EST00628",
          "EST00629",
          "EST00630",
          "EST01119",
          "EST00631",
          "EST00632",
          "EST00633",
          "EST01546",
          "EST00634",
          "EST00635",
          "EST00636",
          "EST01301"
        ],

        form: {
          codDepDestino: '',
          codPosDestino: 'POS01',
          numeroDocumento: '',
          data: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
          dataFormatada: this.$options.filters.date(new Date()),
          patrimonios: '',
          fechado: false,
          qtdEquipamentos: ''
        }
      }
    },

    computed: {
      dialog() {
        return this.$route.name === 'Formulario de Nova Remessa'
      },

      deps() {
        return Object.keys(this.$store.getters.getDepositos)
      },
    },

    watch: {
      'form.data': function () {
        if (this.form.data) {
          const dataArr = this.form.data.split('-')
          this.form.dataFormatada = this.$options.filters.date(new Date(dataArr[0], dataArr[1] - 1, dataArr[2]))
        }
      },

      'form.codDepDestino': _.debounce(function () {
        const app = this
        if (!app.form.codDepDestino) {

        } else if (app.form.codDepDestino.length === 6) {
          const {codDepDestino, codPosDestino} = app.form
          let i = 0
          const elements = {}
          app.$store.dispatch('resetOnusDepCarregadas')
          app.codOnus.forEach(codOnu => {
            app.$store.getters.delayedGet(`${app.$store.getters.getAirServerAdress}/deposito/find_serial/${codDepDestino}/${codPosDestino}/${codOnu}`, 200 * i, ({data}) => {
              data.forEach(onu => {
                elements[onu.serial] = onu
              })
            }, err => {
              app.$store.dispatch('setErrorAlert', `Erro! Não foi possível buscar as ONUs com código: '${codOnu}'`)
              console.log(err)
            })
            i++
          })
          app.$store.dispatch('setOnusDepCarregadas', elements)
        }
      }, 500),

      'form.patrimonios'() {
        if(this.form.patrimonios)
          this.form.qtdEquipamentos = this.form.patrimonios.trim().split('\n').length
      },

      'form.dataFormatada'() {
        let formattedDate = this.form.dataFormatada
        if(formattedDate.length === 8) {
          const day = formattedDate.substr(0, 2)
          const month = formattedDate.substr(2, 2)
          const year = formattedDate.substr(4, 4)
          this.form.data = `${year}-${month}-${day}`
        }
      }

    },

    methods: {
      fechar() {
        this.$router.push({name: 'Controle de Remessas'})
      },

      limpar() {
        this.$refs.form.reset()
      },

      enviar() {
        const app = this
        let payload = {...app.form}
        payload.numeroDocumento = parseInt(payload.numeroDocumento)
        if (app.$refs.form.validate()) {
          app.enviando = true
          app.$store.dispatch('saveRemessaToFirebase', payload)
            .then(resp => {
              app.enviando = false
              app.limpar()
              app.$store.dispatch('setSuccessAlert', resp)
            })
            .catch(err => {
              app.enviando = false
              console.log(err)
              app.$store.dispatch('setErrorAlert', 'Ops! Ocorreu um erro ao cadastrar a remessa.')
            })
        }
      },

//      pegarRemessas() {
//        this.enviando = true
//        axios.get('http://192.168.1.13:8080/remessas')
//          .then(({data}) => {
//          let itensRemessa = {}
//            data.forEach(remessa => {
//              const itens = remessa.itensRemessa.slice()
//              remessa.itensRemessa = {}
//              itensRemessa[remessa.numeroDocumento] = {}
//              const dataArr = remessa.data.split('-')
//              remessa.data = new Date(dataArr[0], dataArr[1] - 1, dataArr[2]).getTime()
//              delete remessa.dataFormatada
//              remessa.qtdEquipamentos = itens.length
//
//              itens.forEach(item => {
//                delete item.id
//                remessa.itensRemessa[item.serial.toUpperCase()] = true
////                delete remessa.itensRemessa.serial
//                 itensRemessa[remessa.numeroDocumento][item.serial] = item
//              })
//            })
//            const modData = data.slice()
//            data = {}
//            modData.forEach(obj => {
//              data[obj.numeroDocumento] = obj
//              delete data.numeroDocumento
//            })
//            firebase.database().ref().child('remessas').set(data)
//            firebase.database().ref().child('itens_remessas').set(itensRemessa)
//            this.enviando = false
//          })
//          .catch(err => {
//            this.enviando = false
//            console.log(err)
//          })
//      }
    },

    mounted() {
    }
  }
</script>
