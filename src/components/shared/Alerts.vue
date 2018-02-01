<template>
  <v-layout>
    <v-flex>
      <v-alert
        :color="alertData.color"
        :icon="alertData.icon"
        v-model="alertData.isAlert"
        transition="slide-y-transition">
        {{ alertData.text }}
      </v-alert>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    computed: {
      alertData() {
        return this.$store.getters.getAlertData
      }
    }
  }
</script>
