<template>
  <v-snackbar
    id="toast"
    absolute
    :top="true"
    :color="alertData.color"
    v-model="alertData.isAlert">
    <v-icon left>
      {{ alertData.icon }}
    </v-icon>
    {{ alertData.text }}
    <v-btn dark flat @click.native="clear">Fechar</v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    computed: {
      alertData() {
        return this.$store.getters.getAlertData
      }
    },

    methods: {
      clear() {
        this.$store.dispatch('clearAlert')
      }
    }
  }
</script>

<style>
  #toast {
    z-index: 1000;
  }
</style>
