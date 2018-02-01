<template>
  <v-dialog v-model="dialog" persistent max-width="1600px">
    <v-card>
      <v-card-title>
        <v-layout row>
          <v-flex>
            <small>
              <b>Registro {{ filteredItems.indexOf(remessa.numeroDocumento) + 1 }} de {{ filteredItems.length }}</b>
            </small>
          </v-flex>

          <v-flex xs12 md4 text-xs-center>
            <span class="headline">
              Remessa Nº {{ remessa.numeroDocumento }}<br>
            </span>
          </v-flex>

          <v-flex xs12 md4>
            <v-speed-dial v-model="fab" absolute right hover direction="left" transition="scale-transition">
              <v-btn
                @click="fechar"
                :loading="loading"
                v-model="fab"
                hover
                fab
                dark
                :color="fab ? 'red' : 'blue darken-2'"
                slot="activator">
                <v-icon>more_horiz</v-icon>
                <v-icon>close</v-icon>
              </v-btn>

              <v-tooltip top>
                <v-btn
                  slot="activator"
                  fab
                  dark
                  small
                  @click="downloadRemessa"
                  color="blue-grey">
                  <v-icon>cloud_download</v-icon>
                </v-btn>
                <span>Baixar ONUs não instaladas</span>
              </v-tooltip>

              <v-tooltip top>
                <v-btn
                  slot="activator"
                  @click="menu = true"
                  fab
                  dark
                  small
                  color="secondary">
                  <v-icon>filter_list</v-icon>
                </v-btn>
                <span>Filtros</span>
              </v-tooltip>

              <v-tooltip top v-if="remessa.percInstalada === 100">
                <v-btn
                  slot="activator"
                  @click="fecharRemessa(remessa.numeroDocumento)"
                  fab
                  dark
                  small
                  color="primary">
                  <v-icon>done</v-icon>
                </v-btn>
                <span>Fechar Remessa</span>
              </v-tooltip>
            </v-speed-dial>
          </v-flex>
        </v-layout>
      </v-card-title>

      <v-dialog v-model="menu">
        <v-card>
          <v-card-text>
            <v-layout>
              <v-flex>
                <v-radio-group v-model="search">
                  <v-radio
                    label="Não Instalada"
                    value="Não instalada!"
                    @change="menu = false"></v-radio>
                </v-radio-group>
                <v-btn color="error" @click="search = ''; menu = false">Limpar Filtro</v-btn>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-card-text>
        <v-layout row>
          <v-flex xs12 md4>
            <div>
              <v-icon left class="primary--text">location_on</v-icon>
              <b>Destino: {{ remessa.codDepDestino }} - {{ depositos[remessa.codDepDestino] }}</b>
            </div>
            <div>
              <v-icon left class="secondary--text">today</v-icon>
              <b>Data da remessa: {{ remessa.dataFormatada }}</b>
            </div>
          </v-flex>

          <v-spacer></v-spacer>

          <v-flex>
            <v-text-field
              append-icon="search"
              label="Pesquisar"
              single-line
              hide-details
              v-model="search"
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-card-text>

      <v-layout row>
        <v-flex>
          <v-tooltip top>
            <v-btn @click="remessaAnterior" flat small style="height: 100%" slot="activator">
              <v-icon large color="grey darken-2">chevron_left</v-icon>
            </v-btn>
            <span>Remessa Anterior</span>
          </v-tooltip>
        </v-flex>

        <v-flex xs12>
          <v-tabs dark>
            <v-tabs-bar class="blue darken-2">
              <v-tabs-item href="#completa" ripple>Remessa Completa</v-tabs-item>
              <v-tabs-item
                v-for="(value, key) in filteredOnus"
                :href="'#' + key"
                :key="key"
                v-if="value.length !== 0">{{ key }}</v-tabs-item>
              <v-tabs-slider color="yellow"></v-tabs-slider>
              <v-spacer></v-spacer>
              <v-tooltip top>
                <v-progress-circular
                  slot="activator"
                  :width="5"
                  :rotate="360"
                  :value="remessa.percInstalada"
                  :style="{color: `rgb(${remessa.color.red}, ${remessa.color.green}, 0)`}"
                  :size="40">{{ remessa.percInstalada }}%
                </v-progress-circular>
                <span>Percentual ONUs Instaladas</span>
              </v-tooltip>
            </v-tabs-bar>

            <v-tabs-items>
              <v-tabs-content id="completa">
                <est-remessa-data-table
                  :search="search"
                  :dadosRemessa="remessa.itensRemessa"></est-remessa-data-table>
              </v-tabs-content>

              <v-tabs-content v-for="(value, key) in filteredOnus"
                              :id="key"
                              :key="key"
                              v-if="value.length !== 0">
                <est-remessa-data-table
                  :search="search"
                  :dadosRemessa="value"></est-remessa-data-table>
              </v-tabs-content>
            </v-tabs-items>
          </v-tabs>
        </v-flex>

        <v-flex>
          <v-tooltip top>
            <v-btn @click="proximaRemessa" flat large style="height: 100%" slot="activator">
              <v-icon large color="grey darken-2">chevron_right</v-icon>
            </v-btn>
            <span>Próxima Remessa</span>
          </v-tooltip>
        </v-flex>
      </v-layout>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" flat @click.native="fechar">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        fab: false,
        menu: false,
        loading: false,
        search: '',
      }
    },

    methods: {
      fechar() {
        this.$router.push({name: 'Controle de Remessas'})
      },

      downloadRemessa() {
        this.loading = true
        const remessa = {...this.remessa}
        const itensRemessa = remessa.itensRemessa
        const codDep = remessa.codDepDestino

        remessa.descricaoDep = this.$store.getters.getDepositos[codDep]
        remessa.itensRemessa = []

        itensRemessa.forEach(item => {
          let posicaoAtual = item.posicaoAtual
          if (posicaoAtual.carregado) {
            remessa.itensRemessa.push(item)
            const index = remessa.itensRemessa.indexOf(item)
            remessa.itensRemessa[index].posicaoAtualSap = posicaoAtual.deposito_codigo
              + ' - ' + posicaoAtual.deposito_nome
              + ' - ' + posicaoAtual.posicao_nome
              + ' - ' + posicaoAtual.cliente_nome
          }
        })
        axios.post('http://192.168.1.13:8080/files/create_file', remessa)
          .then(() => {
            this.loading = false
            window.location.assign(`http://192.168.1.13:8080/files/${remessa.numeroDocumento}`)
          })
          .catch(err => {
            this.loading = false
            console.log(err)
            this.$store.dispatch('setErrorAlert', 'Não foi possível baixar a remessa selecionada.')
          })
      },

      proximaRemessa() {
        const filteredItems = this.filteredItems
        let index = filteredItems.indexOf(this.remessa.numeroDocumento) + 1
        if (!(index >= filteredItems.length)) {
          const nextId = filteredItems[index]
          this.$router.push({name: 'Remessa', params: {id: nextId}})
        } else {
          index = 0
          const nextId = filteredItems[index]
          this.$router.push({name: 'Remessa', params: {id: nextId}})
          this.$store.dispatch('setInfoAlert', 'Primeiro registro')
        }
      },

      remessaAnterior() {
        const filteredItems = this.filteredItems
        let index = filteredItems.indexOf(this.remessa.numeroDocumento) - 1
        if (!(index < 0)) {
          const prevId = filteredItems[index]
          this.$router.push({name: 'Remessa', params: {id: prevId}})
        } else {
          index = filteredItems.length - 1
          const prevId = filteredItems[index]
          this.$router.push({name: 'Remessa', params: {id: prevId}})
          this.$store.dispatch('setInfoAlert', 'Último registro')
        }
      },

      fecharRemessa(numeroDocumento) {
        axios.get(`http://192.168.1.13:8080/remessas/fechar/${numeroDocumento}`)
          .then(({data}) => {
            this.$store.dispatch('setSuccessAlert', data)
            this.$store.dispatch('fecharRemessa', numeroDocumento)
          })
          .catch(err => {
            console.log(err)
            this.store.dispatch('setErrorAlert', `Erro! Não foi possível fechar a remessa ${numeroDocumento}`)
          })
      }
    },

    computed: {
      dialog() {
        return this.$route.name === 'Remessa'
      },

      remessa() {
        return this.$store.getters.getRemessa(this.$route.params.id)
      },

      depositos() {
        return this.$store.getters.getDepositos
      },

      filteredItems() {
        return this.$store.getters.getFilteredItems
      },

      onuGroups() {
        return this.$store.getters.getOnuGroups
      },

      filteredOnus() {
        let obj = {}
        const onuGroup = this.onuGroups
        for(let key in onuGroup) {
          let filteredOnu = this.remessa.itensRemessa.filter(item => {
            return onuGroup[key].indexOf(item.codItem) >= 0
          })
          obj[key] = filteredOnu
        }

        return obj
      }
    }
  }
</script>
