<template>
  <v-container>
    <v-layout row v-for="(item, index) in news" :key="index">
      <v-flex d-flex xs12 sm3 ma-2 v-for="(article, index) in item" :key="index">
        <v-card>
          <v-card-media :src="article.urlToImage" height="200px"></v-card-media>
          <v-card-title primary-title class="headline">
            <div>{{ article.title }}</div>
          </v-card-title>

          <v-card-text class="grey--text subheader">
            {{ article.description.slice(0, 100) }}...
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <!--<small>{{ article.publishedAt | dateTime }}</small>-->
            <v-spacer></v-spacer>
            <v-btn flat color="orange" :href="article.url" target="_blank">Ler mais...</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        news: [],
        newsPerRow: 4
      }
    },

    mounted() {
      let app = this
      axios.get('https://newsapi.org/v2/top-headlines?sources=info-money&apiKey=f2b25435fd494a6c95fabf43109e6ccc')
        .then(({data}) => {
          const times = Math.ceil(data.articles.length / app.newsPerRow)
          for(let i = 0; i < times; i++) {
            app.news.push(data.articles.slice(i * app.newsPerRow, (i + 1) * app.newsPerRow))
          }
        })
        .catch(err => console.log(err))
    }
  }
</script>
