<template>
  <v-app light>
    <v-toolbar app>
      <v-toolbar-title style="cursor: pointer">
        <router-link :to="{ name: 'Home' }" :exact="true" tag="span">
          <v-icon xLarge left>business</v-icon>
          <span style="color: gray">Estoque</span>
        </router-link>
      </v-toolbar-title>
      <v-toolbar-items>
        <v-btn
          router
          :to="{ name: item.linkName }"
          :exact="item.exact"
          v-for="item in menuItems"
          :key="item.name"
          flat>
          <v-icon left>{{ item.icon }}</v-icon>
          {{ item.name }}
        </v-btn>

      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-btn
        router
        :to="{ name: 'Imprimir' }"
        flat>
        <v-icon>print</v-icon>
      </v-btn>
    </v-toolbar>
    <est-alert-toast></est-alert-toast>

    <main app>
      <v-content>
        <router-view></router-view>
      </v-content>
    </main>

    <v-footer app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    data() {
      return {
        menuItems: [
          {
            name: 'Home',
            icon: 'home',
            linkName: 'Home',
            id: 'home-link',
            exact: true
          },
          {
            name: 'Controle de ONUs',
            icon: 'local_shipping',
            linkName: 'Controle de Remessas',
            id: 'remessas-link',
            exact: false
          },
          {
            name: 'Relatórios',
            icon: 'pie_chart',
            linkName: 'Relatorios',
            id: 'relatorios-link',
            exact: false
          }
        ]
      }
    }
  }

</script>

<style lang="stylus">
  @import './stylus/main'
</style>
