<template>
  <v-container mt-3>
    <router-view></router-view>
    <v-card class="pl-3 pr-3">
      <v-layout row>
        <v-flex xs12 sm11>
          <v-card-title>
            <h5>Controle de Remessas</h5>
          </v-card-title>
        </v-flex>

        <v-flex xs12 sm1>
          <v-speed-dial
            v-model="fab"
            absolute
            right
            hover
            direction="left"
            transition="scale-transition">
            <v-btn
              v-model="fab"
              hover
              fab
              dark
              color="blue darken-2"
              slot="activator">
              <v-icon>more_horiz</v-icon>
              <v-icon>close</v-icon>
            </v-btn>

            <v-tooltip top>
              <v-btn
                slot="activator"
                router
                :to="{name: 'Formulario de Nova Remessa'}"
                fab
                dark
                small
                color="primary">
                <v-icon>add</v-icon>
              </v-btn>
              <span>Nova Remessa</span>
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
          </v-speed-dial>

          <v-dialog v-model="menu">
            <v-card>
              <v-card-text>
                <v-layout>
                  <v-flex>
                    <p>Depósitos:</p>
                    <v-radio-group v-model="search">
                      <v-radio v-for="(deposito, key) in depositos" :label="deposito" :value="key"
                               :key="key" @change="menu = false"></v-radio>
                    </v-radio-group>
                    <v-btn color="error" @click="search = ''; menu = false">Limpar Filtro</v-btn>
                  </v-flex>
                </v-layout>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex mb-3>
          <v-text-field
            append-icon="search"
            label="Pesquisar"
            single-line
            hide-details
            v-model="search"></v-text-field>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex>
          <v-data-table
            dark
            ref="dataTable"
            :rows-per-page-items="[5, 10, 15, 25, {text: 'Todas', value: -1}]"
            must-sort
            rows-per-page-text="Linhas por página:"
            no-data-text="Dados não disponíveis!"
            no-results-text="Nenhum resultado encontrado!"
            :headers="headers"
            :items="items"
            :search="search"
            :pagination.sync="pagination"
            class="elevation-1">
            <template slot="headerCell" scope="props">
          <span>
            {{ props.header.text }}
          </span>
            </template>
            <template slot="items" scope="props">
              <tr style="cursor: pointer" @click="ir(props.item.numeroDocumento)">
                <td class="text-xs-center">
                  {{ (pagination.page * pagination.rowsPerPage) - (pagination.rowsPerPage - props.index - 1) }}
                </td>
                <td>{{ props.item.numeroDocumento }}</td>
                <td class="text-xs-left">{{ props.item.codDepDestino
                  }} {{ props.item.nomeDeposito = undefined ? '' : props.item.nomeDeposito }}
                </td>
                <td class="text-xs-right">{{ props.item.qtdEquipamentos }}</td>
                <td class="text-xs-right">{{ props.item.dataFormatada }}</td>
                <!--<td class="text-xs-right">{{ props.item.fechado ? 'Sim' : 'Não' }}</td>-->
                <td class="text-xs-right">
                  <v-progress-circular
                    v-if="props.item.dias === undefined"
                    indeterminate
                    :size="20"
                    color="secondary"></v-progress-circular>
                  <div v-else>{{ props.item.dias }}</div>
                </td>
                <td class="text-xs-center">
                  <v-progress-circular
                    v-if="props.item.percInstalada === undefined"
                    indeterminate
                    :size="20"
                    color="secondary"></v-progress-circular>

                  <v-tooltip top v-else>
                    <v-menu
                      :disabled="props.item.percInstalada !== 100"
                      open-on-hover
                      right
                      offset-x
                      slot="activator">
                      <v-progress-circular
                        slot="activator"
                        :width="5"
                        :rotate="360"
                        :value="props.item.percInstalada"
                        :style="{color: `rgb(${props.item.color.red}, ${props.item.color.green}, 0)`}"
                        :size="40">{{ props.item.percInstalada }}%
                      </v-progress-circular>
                      <v-list>
                        <v-list-tile @click="fecharRemessa(props.item.numeroDocumento)">
                          <v-list-tile-title>Fechar Remessa</v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                    <span>{{ props.item.percInstalada }}%</span>
                  </v-tooltip>
                </td>
              </tr>
              <v-card></v-card>
            </template>
            <template slot="pageText" scope="{ pageStart, pageStop, itemsLength }">
              {{ pageStart }}-{{ pageStop }} de {{ itemsLength }}
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-pagination v-model="pagination.page" :length="pages" circle total-visible="7"></v-pagination>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import lodash from 'lodash'

  export default {
    data() {
      return {
        fab: false,
        menu: false,
        expandPanel: false,
        loading: true,
        showTooltip: '',
        search: '',
        pagination: {
          sortBy: 'dias',
          descending: true
        },
        headers: [
          {text: '#', value: 'index', sortable: false, align: 'center'},
          {text: 'Nº Documento', value: 'numeroDocumento', align: 'center'},
          {text: 'Depósito Destino', value: 'codDepDestino', align: 'center'},
          {text: 'Qtd de Equipamentos', value: 'qtdEquipamentos', align: 'center'},
          {text: 'Data do Pedido', value: 'dataPedido', align: 'center'},
//          {text: 'Fechada?', value: 'fechado', align: 'center'},
          {text: 'Nº de Dias', value: 'dias', align: 'center'},
          {text: '% Instalado', value: 'percInstalada', align: 'center'}
        ],
      }
    },

    computed: {
      items() {
        return this.$store.getters.getRemessasAbertas
      },

      pages() {
        if (this.pagination.totalItems) {
          return this.pagination.rowsPerPage ? Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage) : 0
        } else if (this._isMounted) {
          return Math.ceil(this.items.length / this.pagination.rowsPerPage)
        }
      },

      depositos() {
        let deps = this.$store.getters.getDepositos
        let keysSorted = Object.keys(deps).sort((a, b) => {
          let param1 = deps[a].toUpperCase()
          let param2 = deps[b].toUpperCase()

          if(param1 < param2) return -1
          if(param1 > param2) return 1
          return 0
        })
        let obj = {}
        keysSorted.forEach(item => obj[item] = deps[item])

        return obj
      }
    },

    watch: {
      search() {
        this.getFilteredItems()
      },

      'pagination.sortBy'() {
        this.getFilteredItems()
      },

      'pagination.descending'() {
        this.getFilteredItems()
      }
    },

    methods: {
      ir(val) {
        this.$router.push({name: 'Remessa', params: {id: val}})
      },

      getFilteredItems: _.debounce(function () {
        const pagination = {...this.pagination}
        this.pagination.rowsPerPage = -1
        const filtered = []
        this.$refs.dataTable.filteredItems.forEach(item => filtered.push(item.numeroDocumento))
        this.pagination.rowsPerPage = pagination.rowsPerPage
        this.$store.dispatch('setFilteredItems', filtered)
      }, 500),

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

    mounted() {
      const remessas = this.$store.getters.getRemessas
      if (remessas.length === 0) {
        this.$store.dispatch('getRemessasFromServer')
      }
    }
  }
</script>
