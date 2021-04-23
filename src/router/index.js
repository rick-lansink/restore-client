import Vue from 'vue'
import VueRouter from 'vue-router'
import Projects from '../views/Projects'
import Home from "../views/Home.vue";
import { authGuard } from "../libs/auth/authGuard";
import Create from "../views/Projects/Create";
import ProjectDetail from '../views/ProjectDetail/index';
import ProjectCreateSidebar from "../views/ProjectDetail/ProjectCreate/sidebar";
import ProjectCreateTop from '../views/ProjectDetail/ProjectCreate/top';
import AttachOAuth from "../views/Projects/AttachOAuth";
import ProjectOverviewSidebar from "../views/ProjectDetail/ProjectOverview/sidebar";
import ProjectOverviewTop from '../views/ProjectDetail/ProjectOverview/top';
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
    path: '/projects/attachOAuth/:id',
    name: 'projectAttachOAuth',
    component: AttachOAuth,
    beforeEnter: authGuard
  },
  {
    path: '/project/:projectId',
    name: 'projectDetail',
    beforeEnter: authGuard,
    component: ProjectDetail,
    children: [
        {
          path: 'overview',
          components: {
            sidebar: ProjectOverviewSidebar,
            topview: ProjectOverviewTop
          }
        }, {
          path :'create',
          components: {
            sidebar: ProjectCreateSidebar,
            topview: ProjectCreateTop
          }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
