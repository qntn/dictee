import { createRouter, createWebHistory } from 'vue-router'
import DictationList from './components/DictationList.vue'
import CreateDictation from './components/CreateDictation.vue'
import PlayDictation from './components/PlayDictation.vue'

const routes = [
  { path: '/', component: DictationList },
  { path: '/creer', component: CreateDictation },
  { path: '/dictation/:id', component: PlayDictation },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
