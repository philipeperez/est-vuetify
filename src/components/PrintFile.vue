<template>
  <v-container mt-0>
    <form formenctype="multipart/form-data">
      <v-text-field v-model="fileName" readonly></v-text-field>
      <v-btn color="primary" @click="onPickFile">
        <v-icon left>folder_open</v-icon>
        Escolher Arquivo
      </v-btn>
      <v-btn raised @click="send">
        <v-icon>print</v-icon>
      </v-btn>
      <input style="display: none" type="file" name="file" ref="fileInput" @change="onFilePicked"/>
    </form>
  </v-container>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        file: '',
        fileName: ''
      }
    },

    methods: {
      onPickFile() {
        this.$refs.fileInput.click()
      },
      onFilePicked(event) {
        const file = event.target.files[0]
        this.file = file
        this.fileName = file.name
      },

      send() {
        if(!this.file)
          return
        const app = this
        let data = new FormData()
        data.append('file', this.file)
        axios.post(`${this.$store.getters.getLocalServerAdress}/files/upload_file`, data)
          .then(({data}) => {
            app.$store.dispatch('setSuccessAlert', data)
          })
      }
    }
  }
</script>
<style scoped>

</style>
