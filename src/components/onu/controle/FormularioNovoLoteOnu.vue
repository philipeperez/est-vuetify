<template>
  <v-container>
    <v-card>
      <v-card-title class="headline">Novo Lote</v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          lazy-validation>
          <v-text-field
            v-model="form.numeroDocumento"
            label="Numero Documento"
            :rules="form.rules.numeroDocumento"></v-text-field>

          <v-menu
            lazy
            v-model="datePicker"
            transition="scale-transition"
            offset-y
            full-width
            :nudge-right="40"
            max-width="290px"
            min-width="290px">
            <v-text-field
              @focus="datePicker = true"
              box
              required
              :rules="form.rules.data"
              slot="activator"
              label="Data do documento"
              v-model="form.data"
              prepend-icon="event"
              readonly></v-text-field>
            <v-date-picker
              :title-date-format="{year: 'numeric', month: '2-digit', day: '2-digit'}"
              locale="pt-br"
              v-model="form.rawDate"
              scrollable></v-date-picker>
          </v-menu>

          <!--<v-text-field-->
          <!--label="Quantidade de Itens"-->
          <!--v-model="form.numItens"></v-text-field>-->

          <v-text-field
            clearable
            v-model="itens"
            label="Itens"
            multi-line></v-text-field>
          <v-text-field
            v-model="form.numItens"
            label="Quantidade de Itens"></v-text-field>


          <v-card-actions>
            <v-btn
              :loading="loading"
              color="primary"
              @click="enviar">Enviar
            </v-btn>
          </v-card-actions>

          <!--<v-list>-->
          <!--<v-list-tile v-for="(item, index) in form.displayItems" :key="index">-->
          <!--<v-list-tile-content>-->
          <!--<v-list-tile-title>{{ index + 1 + ' - ' + item[0] + ' - ' + item[1] + ' - ' + item[2] }}</v-list-tile-title>-->
          <!--</v-list-tile-content>-->
          <!--</v-list-tile>-->
          <!--</v-list>-->

          <!--<v-container fluid grid-list-md>-->
          <!--<v-layout v-for="(item, index) in form.displayItems" :key="index" justify-space-between>-->
          <!--<v-flex xs1>-->
          <!--<v-text-field :disabled="true" :label="index + 1 + ':'" box readonly></v-text-field>-->
          <!--</v-flex>-->

          <!--<v-flex xs3>-->
          <!--<v-text-field label="Patrimônio" box v-model="item[0]"></v-text-field>-->
          <!--</v-flex>-->

          <!--<v-flex xs4>-->
          <!--<v-text-field label="Mac" box v-model="item[1]"></v-text-field>-->
          <!--</v-flex>-->

          <!--<v-flex xs4>-->
          <!--<v-text-field label="Serial" box v-model="item[2]"></v-text-field>-->
          <!--</v-flex>-->
          <!--</v-layout>-->
          <!--</v-container>-->
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
  import * as firebase from 'firebase'
  import axios from 'axios'

  export default {
    data() {
      return {
        loading: false,
        itens: '',
        form: {
          numeroDocumento: '',
          data: this.$options.filters.date(new Date()),
          rawDate: new Date(),
          numItens: 0,
          itens: '',
          rules: {
            numeroDocumento: [
              (v) => !!v || 'Insira o número do documento',
              (v) => /[0-9]/.test(v) || 'Número de documento inválido'
            ],
            data: [],
            itens: []
          }
        },
        datePicker: false
      }
    },

    computed: {
      formRef() {
        return this.$refs.form
      }
    },

    watch: {
      itens() {
        if (this.itens) {
          let arr = []
          let arr2 = this.itens.trim().split('\n')
          arr2.forEach(item => arr.push(item.split('\t')))
          this.form.itens = arr
          this.form.numItens = arr.length
        }
      },

      'form.rawDate'() {
        const dateSplit =  this.form.rawDate.split('-')
        this.form.data = this.$options.filters.date(new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2]))
      }
    },

    methods: {
      enviar() {
        const app = this
        app.loading = true

        const db = firebase.database()
        const lotesRef = db.ref('lotes')
        const loteRef = lotesRef.child(this.form.numeroDocumento)
        const dateSplit = app.form.data.split('/')
        let itensLote = {}

        const equipamentosRef = db.ref('equipamentos')
        let equipamentos = {}

        axios.get(`${app.$store.getters.getAirServerAdress}/deposito/find_by_serial/${app.form.itens[0][0]}`, app.$store.getters.getAirHeaders)
          .then(({data}) => {
            app.form.itens.forEach(item => {
              itensLote[item[2]] = true
              equipamentos[item[2]] = {
                cod: data.item_codigo,
                patrimonio: item[0],
                mac: item[1],
                serial: item[2]
              }
            })
            let lote = {
              numeroDocumentoSap: app.form.numeroDocumento,
              data: new Date(dateSplit[2], dateSplit[1] - 1, dateSplit[0]).getTime(),
              qtdItens: app.form.itens.length,
              itensLote
            }
            equipamentosRef.set(equipamentos).then(() => {
              loteRef.set(lote)
                .then(() => {
                  app.formRef.reset()
                  app.$store.dispatch('setSuccessAlert', 'Dados gravados com sucesso!')
                  app.loading = false
                })
                .catch(err => {
                  app.$store.dispatch('setErrorAlert', 'Ops! Ocorreu um erro ao salvar os dados.')
                  console.log(err)
                  app.loading = false
                })
            }).catch(err => {
              console.log(err)
              app.$store.dispatch('setErrorAlert', 'Ops! Ocorreu um erro ao salvar os dados.')
              app.loading = false
            })
          })
          .catch(err => {
            app.$store.dispatch('setErrorAlert', 'Ops! Ocorreu um erro ao recuperar o código do item.')
            console.log(err)
            app.loading = false
          })
      }
    },

    mounted() {

    }
  }
</script>
