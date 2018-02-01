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
        <span v-if="props.header.text === 'Posição Atual SAP'">({{ percentualPosicoes }}%)</span>
        <div v-if="props.header.text === 'Posição Atual SAP'">
          <v-progress-linear
            :size="40"
            :width="5"
            :rotate="360"
            :value="percentualPosicoes"
            color="green">
          </v-progress-linear>
        </div>
      </span>
    </template>

    <template slot="items" scope="props">
      <td class="text-xs-center">
        {{ (pagination.page * pagination.rowsPerPage) - (pagination.rowsPerPage - props.index - 1) }}
      </td>
      <td>{{ props.item.codItem }}</td>
      <td>{{ props.item.patrimonio }}</td>
      <td>{{ props.item.serial }}</td>
      <td>{{ props.item.mac }}</td>
      <td>
        <v-chip
          :color="props.item.instalada ? 'green' : 'orange'"
          text-color="white">
          {{ props.item.instalada ? 'Instalada' : 'Não Instalada' }}
        </v-chip>
      </td>
      <td class="text-xs-left">
        <v-btn
          :loading="props.item.posicaoAtual.carregando"
          @click="buscarPosicaoAtual(props.item)"
          color="blue darken-1"
          flat
          v-if="(props.item.posicaoAtual.carregando || !props.item.posicaoAtual.carregado) && !props.item.instalada">
          Buscar Posição Atual
        </v-btn>
        <div v-else>
          <v-layout row>
            <v-flex xs12 md11>
              {{ props.item.posicaoAtual.deposito_codigo || '' }}-{{ props.item.posicaoAtual.deposito_nome || '' }}<br>
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
  //  <v-progress-circular
  //  v-bind:size="40"
  //  v-bind:width="15"
  //  v-bind:rotate="360"
  //  v-bind:value="10"
  //  color="teal"
  //    >
  //    Teste
  //    </v-progress-circular>
  export default {
    props: [
      'dadosRemessa',
      'search',
      'percentualPosicoes'
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
          {text: 'Instalada', value: 'instalada', align: 'center'},
          {text: 'Posição Atual SAP', value: '', align: 'center', sortable: false}
        ]
      }
    },

    methods: {
      buscarPosicaoAtual(item) {
        this.$store.dispatch('getOnuPosition', item)
      },

      removerEquipamento(item) {
        const app = this
        app.loading = true
        this.$store.dispatch('removeItemRemessaFromFb', item)
          .then(() => app.loading = false)
      }
    },

    computed: {
      pages() {
        if (this.pagination.totalItems)
          return this.pagination.rowsPerPage ? Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage) : 0
        else
          return this.pagination.rowsPerPage ? Math.ceil(this.dadosRemessa.length / this.pagination.rowsPerPage) : 0
      }
    },

    mounted() {
//      firebase.database().ref().child('itens_remessas').orderByChild('codItem').once('value').then(snap => console.log(snap.val()))
    }
  }
</script>
