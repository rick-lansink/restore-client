import Vue from 'vue'
import App from './App.vue'
import { createProvider } from './vue-apollo'
import router from './router'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { domain, clientId } from "../auth_config.json";
import { Auth0Plugin } from "./libs/auth";
import Toasted from 'vue-toasted';
import store from "@/store";
import VueClipboard from 'vue-clipboard2'

Vue.config.productionTip = false

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
Vue.use(Toasted)
Vue.use(VueClipboard)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience: 'hasura',
  onRedirectCallback: appState => {
    console.log(window.location.pathname);
    router.push(
        appState && appState.targetUrl
            ? appState.targetUrl
            : window.location.pathname
    );
  }
});

new Vue({
  apolloProvider: createProvider(),
  store,
  router,
  render: h => h(App)
}).$mount('#app')
