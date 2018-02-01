import Vue from 'vue'
import Router from 'vue-router'

import Remessas from '@/components/onu/controle/RemessasFirebase'
import Remessa from '@/components/onu/controle/RemessaFirebase'
import FormNovaRemessa from '@/components/onu/controle/FormularioNovaRemessa'
import Home from '@/components/Home'
import Relatorios from '@/components/relatorios/Relatorios'
import FormFechamento from '@/components/relatorios/FormFechamento'
import PrintFile from '@/components/PrintFile'

import Testes from './testes'

Vue.use(Router)

export default new Router({
  mode: 'history',
  hashbang: false,
  routes: [
    {
      path: '/imprimir',
      name: 'Imprimir',
      component: PrintFile,
    },
    {
      path: '/controle-de-remessas',
      name: 'Controle de Remessas',
      component: Remessas,
      children: [
        {
          path: 'nova',
          name: 'Formulario de Nova Remessa',
          component: FormNovaRemessa
        },
        {
          path: 'remessa/:id',
          name: 'Remessa',
          component: Remessa,
          props: true
        }
      ]
    },
    {
      path: '/relatorios',
      name: 'Relatorios',
      component: Relatorios,
      children: [
        {
          path: 'form',
          name: 'Formulario de Fechamento',
          component: FormFechamento
        }
      ]
    },
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ].concat(Testes)
})
