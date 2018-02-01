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
                    @focus="datePicker = true"
                    box
                    required
                    :rules="rules.data"
                    slot="activator"
                    label="Data da Remessa"
                    v-model="form.dataFormatada"
                    prepend-icon="event"
                    readonly></v-text-field>
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
  import axios from 'axios'
  import * as firebase from 'firebase'
  import Form from '../../../../classes/Form'

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
            (v) => /[0-9]/.test(v) || 'Insira patrimônios válidos'
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
          data: new Date(),
          dataFormatada: this.$options.filters.date(new Date()),
          patrimonios: ''
        }
      }
    },

    computed: {
      dialog() {
        return this.$route.name === 'Formulario de Nova Remessa'
      },

      deps() {
        const deps = this.$store.getters.getDepositos
        let arr = []

        for (let key in deps) {
          arr.push(key)
        }

        return arr
      }
    },

    watch: {
      'form.data': function () {
        if (this.form.data) {
          const data = this.form.data
          const day = data.slice(8, data.length)
          const month = data.slice(5, 7) - 1
          const year = data.slice(0, 4)

          this.form.dataFormatada = this.$options.filters.date(new Date(year, month, day))
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
            app.$store.getters.delayedGet(`http://10.99.1.17:7010/deposito/find_serial/${codDepDestino}/${codPosDestino}/${codOnu}`, 200 * i, ({data}) => {
              data.forEach(onu => {
                elements[onu.serial] = onu
              })
            }, err => {
              app.$store.dispatch('setErrorAlert', `Erro! Não foi possível buscar as ONUs do depósito ${codDepDestino}`)
              console.log(err)
            })
            i++
          })
          app.$store.dispatch('setOnusDepCarregadas', elements)
        }
      }, 500)

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
        payload.itensRemessa = []
        if (this.$refs.form.validate()) {
          app.enviando = true
          const equipamentos = app.form.patrimonios.split('\n')
          let tempoEspera = 200
          let multiplicador = -1

          equipamentos.forEach(el => {
            let onuObj = app.$store.getters.getOnusDepCarregadas[el]
            if (onuObj !== undefined) {
              let itemRemessa = {
                patrimonio: '',
                serial: '',
                mac: '',
                codItem: '',
                descricao: ''
              }

              itemRemessa.patrimonio = onuObj.serial
              itemRemessa.serial = onuObj.patrimonio
              itemRemessa.mac = onuObj.mac
              itemRemessa.codIem = onuObj.item_codigo
              itemRemessa.descricao = onuObj.item_nome
              payload.itensRemessa.push(itemRemessa)

              if (payload.itensRemessa.length === equipamentos.length) {
                axios.put('http://192.168.1.13:8080/remessas', payload)
                  .then(({data}) => {
                    app.limpar()
                    app.enviando = false
                    app.$store.dispatch('setSuccessAlert', data)
                  })
                  .catch(err => {
                    console.log(err)
                    app.enviando = false
                    app.$store.dispatch('setErrorAlert', 'Erro! Ocorreu um erro ao cadastrar a remessa.')
                  })
              }
            } else {
              multiplicador++
              app.$store.getters.delayedGet(`http://10.99.1.17:7010/deposito/find_by_serial/${el}`, tempoEspera * multiplicador, ({data}) => {
                let itemRemessa = {
                  patrimonio: '',
                  serial: '',
                  mac: '',
                  codItem: '',
                  descricao: ''
                }

                itemRemessa.patrimonio = data.numero_serial
                itemRemessa.serial = data.numero_patrimonio
                itemRemessa.mac = data.numero_mac
                itemRemessa.codItem = data.item_codigo
                itemRemessa.descricao = data.item_nome
                payload.itensRemessa.push(itemRemessa)

                if (payload.itensRemessa.length === equipamentos.length) {
                  axios.put('http://192.168.1.13:8080/remessas', payload)
                    .then(({data}) => {
                      app.limpar()
                      app.enviando = false
                      app.$store.dispatch('setSuccessAlert', data)
                    })
                    .catch(err => {
                      console.log(err)
                      app.$store.dispatch('setErrorAlert', 'Ops! Ocorreu um erro ao cadastrar a remessa.')
                    })
                }
              }, err => {
                console.log(err)
                app.$store.dispatch('setErrorAlert', `Erro! Ocorreu um erro ao buscar o equipamento ${el}`)
              })
            }
          })
        }
      },

//---------------TESTES--------------//
      enviar2() {
        const primaryKey = this.form.numeroDocumento
        const remessas = firebase.database().ref().child(`remessas/${primaryKey}`)
        let form = new Form(this.form)
        form.submit('set', remessas)
        //remessas.child(primaryKey).set(this.form)
      },
    },

    mounted() {

    }
  }
</script>
