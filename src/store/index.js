import Vue from 'vue'
import Vuex from 'vuex'
import { vuexOidcCreateStoreModule } from 'vuex-oidc'
import { oidcSettings } from '../config/oidc'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    id: null
  },
  mutations: {
    'SET_ID': function (state, id) {
      state.id = id
    }
  },
  actions: {
    setId: function ({ commit }, id) {
      commit('SET_ID', id)
    }
  },
  getters: {
    projectId: function(state){
      return state.id
    }
  },
  modules: {
    oidcStore: vuexOidcCreateStoreModule(oidcSettings)
  }
})
