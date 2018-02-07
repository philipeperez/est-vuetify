<template>

</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        tecnicos: ''
      }
    },

    mounted() {
      const getters = this.$store.getters
      const unidades = getters.getUnidades
      const app = this
      axios.post(`${getters.getAirServerAdress}/deposito/find_posicao/tecnico/01.501`,
        unidades, getters.getAirHeaders)
        .then(({data}) => app.tecnicos = data)
    }
  }
</script>
