import Vue from 'vue'
import VueRouter from 'vue-router'
import Projects from '../views/Projects'
import Home from "../views/Home.vue";
import { authGuard } from "../libs/auth/authGuard";
import Create from "../views/Projects/Create";
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Home
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    beforeEnter: authGuard
  },
  {
    path: '/projects/create',
    name: 'projectCreate',
    component: Create,
    beforeEnter: authGuard
  },
  {
    path: '/project/:projectId/',
    name: 'project',
    beforeEnter: authGuard,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/ProjectDetail.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
