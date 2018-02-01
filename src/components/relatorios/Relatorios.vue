<template>
  <v-container>
    <router-view></router-view>
    <v-btn @click="drawer = !drawer">Toogle</v-btn>

    <v-navigation-drawer app v-model="drawer">
      <v-expansion-panel>

        <v-expansion-panel-content v-for="(value, key) in rawData" :key="key">
          <div slot="header">{{ key }}</div>
          <!--<v-list slot="header">-->
            <!--<v-list-tile>-->
              <!--<v-list-tile-title class="title">-->
                <!--{{ key }}-->
              <!--</v-list-tile-title>-->
            <!--</v-list-tile>-->
          <!--</v-list>-->

          <v-expansion-panel>
            <v-expansion-panel-content v-for="(months, keyMonth) in value" :key="keyMonth">
              <div slot="header">{{ meses[keyMonth] }}</div>
              <v-list v-for="(item, itemKey) in months" :key="itemKey">
                <v-list-tile>
                  <v-list-tile-title>
                    <small>{{ item.descricao.slice(0, 30) }}</small>
                  </v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panel-content>
      </v-expansion-panel>


      <v-list>
        <v-list-group v-for="(value, key) in rawData" :key="key">
          <v-list-tile slot="item">
            <v-list-tile-content>
              <v-list-tile-title>{{ key }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>keyboard_arrow_down</v-icon>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-group v-for="(months, keyMonth) in value" :key="keyMonth">
            <v-list-tile slot="item">
              <v-list-tile-content>
                <v-list-tile-title>{{ meses[keyMonth] }}</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon>keyboard_arrow_down</v-icon>
              </v-list-tile-action>
            </v-list-tile>

            <v-list-tile v-for="(item, itemKey) in months" :key="itemKey">
              <v-list-tile-content>
                <v-list-tile-title>{{ item.descricao }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>

          <!--<v-list-tile v-for="(months, keyMonth) in value" :key="keyMonth">-->
            <!--<v-list-tile-content>-->
              <!--<v-list-group>-->
                <!--<v-list-tile slot="item">-->
                  <!--<v-list-tile-content>-->
                    <!--<v-list-tile-title>{{ meses[keyMonth] }}</v-list-tile-title>-->
                  <!--</v-list-tile-content>-->
                  <!--<v-list-tile-action>-->
                    <!--<v-icon>keyboard_arrow_down</v-icon>-->
                  <!--</v-list-tile-action>-->
                <!--</v-list-tile>-->

                <!--<v-list-tile v-for="(item, itemKey) in months" :key="itemKey">-->
                  <!--<v-list-tile-content>-->
                    <!--<v-list-tile-title>{{ item.descricao }}</v-list-tile-title>-->
                  <!--</v-list-tile-content>-->
                <!--</v-list-tile>-->
              <!--</v-list-group>-->
              <!--&lt;!&ndash;<v-list-tile-title>{{ meses[keyMonth] }}</v-list-tile-title>&ndash;&gt;-->
            <!--</v-list-tile-content>-->
          <!--</v-list-tile>-->
        </v-list-group>

        <!--<v-list-group>-->
        <!--<v-list-tile slot="item">-->
        <!--<v-list-tile-content>-->
        <!--<v-list-tile-title>Teste2</v-list-tile-title>-->
        <!--</v-list-tile-content>-->
        <!--<v-list-tile-action>-->
        <!--<v-icon>keyboard_arrow_down</v-icon>-->
        <!--</v-list-tile-action>-->
        <!--</v-list-tile>-->
        <!--<v-list-tile v-for="n in 5" :key="n">-->
        <!--<v-list-tile-content>-->
        <!--<v-list-tile-title>Item {{ n }}</v-list-tile-title>-->
        <!--</v-list-tile-content>-->
        <!--</v-list-tile>-->
        <!--</v-list-group>-->
      </v-list>
    </v-navigation-drawer>

    <v-card width="500">
      <v-progress-circular
        indeterminate
        :size="70"
        :width="7"
        color="primary"
        v-if="loading">A</v-progress-circular>
      <line-chart
        v-else
        :width="500"
        :height="400"
        :data="data"
        :options="{responsive: false, maintainAspectRatio: false}"></line-chart>
    </v-card>
  </v-container>
</template>

<script>
  export default {
    data() {
      return {
        loading: true,
        drawer: false,
        rawData: '',
        meses: {
          '01': 'Janeiro',
          '02': 'Fevereiro',
          '03': 'Março',
          '04': 'Abril',
          '05': 'Maio',
          '06': 'Junho',
          '07': 'Julho',
          '08': 'Agosto',
          '09': 'Setembro',
          '10': 'Outubro',
          '11': 'Novembro',
          '12': 'Dezembro'
        },
        data: {
          labels: [],
          datasets: [
            {
              label: '',
              backgroundColor: 'rgba(248, 121, 121, 0.8)',
              data: []
            }
          ]
        }
      }
    },

    mounted() {
      const app = this
      this.$store.dispatch('firebaseGetOnce', 'saidas_estoque_ctrl').then(snap => {
        console.log(snap.val())
        app.rawData = snap.val()
        const months = Object.keys(snap.val()[2017]).sort()
        months.forEach(el => app.data.labels.push(app.meses[el]))
        months.forEach(el => {
          let element = snap.val()[2017][el]['EST00633']
          app.data.datasets[0].label = element.descricao
          app.data.datasets[0].data.push(element.total)
          app.loading = false
        })
      })
    }
  }
</script>
