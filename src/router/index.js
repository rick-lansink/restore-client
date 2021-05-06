import Vue from 'vue'
import VueRouter from 'vue-router'
import Projects from '../views/Projects'
import Home from "../views/Home.vue";
import { authGuard } from "../libs/auth/authGuard";
import Create from "../views/Projects/Create";
import EditProject from "../views/Projects/Edit";
import ProjectDetail from '../views/ProjectDetail/index';
import RequestSelectSide from "../views/ProjectDetail/RequestSelect/sidebar";
import RequestSelectTop from '../views/ProjectDetail/RequestSelect/top';
import RequestOverviewSide from "../views/ProjectDetail/RequestOverview/sidebar";
import RequestOverviewTop from '../views/ProjectDetail/RequestOverview/top';
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
    path: '/projects/:projectId/edit',
    name: 'projectEdit',
    component: EditProject,
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
          path :'request/:requestId',
          components: {
            sidebar: RequestOverviewSide,
            topview: RequestOverviewTop
          },
      }, {
        path: 'request/:requestId/material_component',
        components: {
          sidebar: RequestSelectSide,
          topview: RequestSelectTop
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
