<template>
  <v-container>

    <v-card>
      <v-form ref="form">
        <v-text-field multiLine v-model="dados" clearable>

        </v-text-field>
        <v-btn color="primary" @click="enviar">Enviar</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        dados: ''
      }
    },

    methods: {
      enviar() {
        axios.get(`${this.$store.getters.getAirServerAdress}/deposito/find_item/01.001/POS01`, this.$store.getters.getAirHeaders)
          .then(({data}) => {
            const mesAtual = '05'
            let codProdutoAtual = ''
            let map = {
              2017: {
                [mesAtual]: {}
              }
            }
            let lines = this.dados.split('\n')
            lines.forEach(item => {
              if (item.trim().length !== 0 && !item.includes('Subtotal diário') && !item.includes('Subtotal mensal') && !item.includes('Subtotal anual') && !item.includes('Data de lançamento')) {
                if (item.startsWith('EST')/* || item.startsWith('CON')*/) {
                  let produto = item.split('\t')
                  codProdutoAtual = produto[0]
                  map[2017][mesAtual][produto[0]] = {
                    descricao: produto[6],
                    total: 0,
                    unidadeMedida: '',
                    cod: produto[0]
                  }
                } else {
                  const lancamento = item.split('\t')
                  const mes = lancamento[0].slice(3, 5)
                  const qtdRetorno = parseInt(lancamento[2]) || 0
                  const qtdEmitida = parseInt(lancamento[3]) || 0
                  const saldo = qtdEmitida - qtdRetorno
                  if (map[2017][mes][codProdutoAtual]['0' + lancamento[4].replace('.', '')]) {
                    map[2017][mes][codProdutoAtual]['0' + lancamento[4].replace('.', '')] += saldo
                    map[2017][mes][codProdutoAtual].total += saldo
                    map[2017][mes][codProdutoAtual].unidadeMedida = lancamento[7]
                  } else {
                    map[2017][mes][codProdutoAtual]['0' + lancamento[4].replace('.', '')] = saldo
                    map[2017][mes][codProdutoAtual].total += saldo
                    map[2017][mes][codProdutoAtual].unidadeMedida = lancamento[7]
                  }
                }
              }
            })
            let obj = map[2017][mesAtual]
            for (let key in obj) {
              if (obj[key].total === 0) {
                delete obj[key]
              }
            }
            // Object.keys(map[2017][mesAtual]).forEach(cod => {
            //   let item = data.find(el => el.item_codigo === cod)
            //   console.log(item.subgrupo_nome)
            //   let subgrupo = item.subgrupo_nome
            //   map[2017][mesAtual].subgrupo = subgrupo
            // })
            console.log(map)
            this.$store.dispatch('firebaseSet', {path: `saidas_estoque_ctrl/2017/${mesAtual}`, value: map[2017][mesAtual]})

          })

      }
    },

    watch: {
      dados() {

      }
    },

    mounted() {
      console.log(this)
    }
  }
</script>
