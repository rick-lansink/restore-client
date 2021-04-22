import Vue from 'vue'
import App from './App.vue'
import { createProvider } from './vue-apollo'
import router from './router'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { domain, clientId } from "../auth_config.json";
import { Auth0Plugin } from "./libs/auth";
import store from "@/store";

Vue.config.productionTip = false

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience: 'hasura',
  onRedirectCallback: appState => {
    console.log(appState, 'abcdef');
    router.push(
        appState && appState.targetUrl
            ? appState.targetUrl
            : window.location.href
    );
  }
});

new Vue({
  apolloProvider: createProvider(),
  store,
  router,
  render: h => h(App)
}).$mount('#app')
