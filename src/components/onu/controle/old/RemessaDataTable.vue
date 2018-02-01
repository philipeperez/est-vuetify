<template>
  <v-data-table
    :loading="loading"
    :rows-per-page-items="rowsPerPageItems"
    rows-per-page-text="Linhas por página:"
    no-data-text="Dados não disponíveis!"
    no-results-text="Nenhum item encontrado!"
    must-sort
    scrollable
    :search="search"
    :pagination.sync="pagination"
    :items="dadosRemessa"
    :headers="headers"
    class="elevation-1">
    <template slot="headerCell" scope="props">
              <span style="text-align: center">
                {{ props.header.text }}
              </span>
    </template>

    <template slot="items" scope="props">
      <td class="text-xs-center">
        {{ (pagination.page * pagination.rowsPerPage) - (pagination.rowsPerPage - props.index - 1) }}
      </td>
      <td>{{ props.item.codItem }} - {{ props.item.descricao }}</td>
      <td>{{ props.item.patrimonio }}</td>
      <td>{{ props.item.serial }}</td>
      <td>{{ props.item.mac }}</td>
      <td>

        <v-tooltip top>
          <v-chip
            style="cursor: pointer;"
            slot="activator"
            :color="props.item.label"
            text-color="white">
            {{ props.item.cliente.slice(0, 50) }}
          </v-chip>
          <span>{{ props.item.cliente }}</span>
        </v-tooltip>
      </td>
      <td class="text-xs-left">
        <v-btn
          :loading="props.item.posicaoAtual.carregando"
          @click="buscarPosicaoAtual(props.item)"
          color="blue darken-1"
          flat
          v-if="(props.item.posicaoAtual.carregando || !props.item.posicaoAtual.carregado) && props.item.cliente === 'Não instalada!'">
          Buscar Posição Atual
        </v-btn>
        <div v-else>
          <v-layout row>
            <v-flex xs12 md11>
              {{ props.item.posicaoAtual.deposito_codigo + '-' + props.item.posicaoAtual.deposito_nome }}<br>
              {{ props.item.posicaoAtual.posicao_nome }} {{ props.item.posicaoAtual.cliente_nome }}
            </v-flex>

            <v-flex xs12 md1 class="text-xs-center"
                    v-if="props.item.posicaoAtual.deposito_codigo === '01.301' || props.item.posicaoAtual.deposito_codigo === '01.001'">
              <v-tooltip top>
                <v-btn
                  slot="activator"
                  :disabled="loading"
                  fab
                  flat
                  color="error"
                  small
                  @click="removerEquipamento(props.item); loading = true">
                  <v-icon>close</v-icon>
                </v-btn>
                <span>Remover item da remessa</span>
              </v-tooltip>
            </v-flex>
          </v-layout>
        </div>
      </td>
    </template>
    <template slot="footer">
      <td colspan="100%" class="text-xs-center">
        <v-pagination v-model="pagination.page" :length="pages" circle total-visible="7"></v-pagination>
      </td>
    </template>
    <template slot="pageText" scope="{ pageStart, pageStop, itemsLength }">
      {{ pageStart }}-{{ pageStop }} de {{ itemsLength }}
    </template>

  </v-data-table>
</template>

<script>
  import axios from 'axios'

  export default {
    props: [
      'dadosRemessa',
      'search'
    ],
    data() {
      return {
        loading: false,
        pagination: {
          sortBy: 'patrimonio',
        },
        rowsPerPageItems: [5, 10, 15, 25, {text: 'Todas', value: -1}],
        headers: [
          {text: '#', value: 'index', sortable: false, align: 'center'},
          {text: 'Item', value: 'codItem', align: 'center'},
          {text: 'Patrimônio', value: 'patrimonio', align: 'center'},
          {text: 'Serial', value: 'serial', align: 'center'},
          {text: 'Mac', value: 'mac', align: 'center'},
          {text: 'Cliente', value: 'cliente', align: 'center'},
          {text: 'Posição Atual SAP', value: '', align: 'center', sortable: false}
        ]
      }
    },

    methods: {
      buscarPosicaoAtual(item) {
        const app = this
        item.posicaoAtual.carregando = true
        this.$forceUpdate()
        const url = `http://10.99.1.17:7010/deposito/find_by_serial/${item.patrimonio}`
        axios.get(url, {headers: {token: 'VVNSMDA3MA=='}})
          .then(({data}) => {
            item.posicaoAtual = data
            item.posicaoAtual.carregando = false
            item.posicaoAtual.carregado = true

            app.$forceUpdate()
          })
          .catch(err => {
            console.log(err)
            item.posicaoAtual.carregando = false
            item.posicaoAtual.carregado = false
            app.$forceUpdate()
            app.$store.dispatch('setErrorAlert', 'Erro! Não foi possível buscar a posição do item.')
          })
      },

      removerEquipamento(item) {
        const app = this

        axios.post('http://192.168.1.13:8080/remessas/remover', item)
          .then(({data}) => {
            app.$store.dispatch('removeItemRemessa', item)
            app.$store.dispatch('setSuccessAlert', data)
            app.loading = false
          })
          .catch(err => {
            console.log(err)
            app.$store.dispatch('setErrorAlert', `Erro! Não foi possível remover o item ${item.patrimonio}`)
            app.loading = false
          })
      }
    },

    computed: {
      pages() {
        if (this.pagination.totalItems)
          return this.pagination.rowsPerPage ? Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage) : 0
        else
          return this.pagination.rowsPerPage ? Math.ceil(this.remessa.itensRemessa.length / this.pagination.rowsPerPage) : 0
      }
    }
  }
</script>
