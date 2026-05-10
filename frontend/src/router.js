import { createRouter, createWebHistory } from 'vue-router'
import DictationList from './components/DictationList.vue'
import CreateDictation from './components/CreateDictation.vue'
import PlayDictation from './components/PlayDictation.vue'
import CreateTextDictation from './components/CreateTextDictation.vue'
import PlayTextDictation from './components/PlayTextDictation.vue'

const routes = [
  { path: '/', component: DictationList },
  { path: '/creer', component: CreateDictation },
  { path: '/dictation/:id', component: PlayDictation },
  { path: '/creer-texte', component: CreateTextDictation },
  { path: '/text-dictation/:id', component: PlayTextDictation },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
