import Vue from "vue";
import router from "../../router";
export default {
    namespaced: true,
    state: {
        token: null,
        user: null,
        isAuthenticated: false
    },
    getters: {
        authenticated(state) {
            return state.isAuthenticated;
        },
        user(state) {
            return state.user;
        },
        getToken(state) {
            return state.token;
        }
    },
    mutations: {
        SET_AUTHENTICATED(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
        SET_TOKEN(state, token) {
            state.token = token;
        },
        SET_USER(state, data) {
            state.user = data;
        }
    },
    actions: {
        async login() {
            Vue.prototype.$auth.loginWithRedirect();
        },
        // async attempt({ commit, state }, token) {
        //
        // },

        logout() {
            localStorage.removeItem('apollo-token')
            Vue.prototype.$auth.logout({
                returnTo: window.location.origin
            })
        },
        setLogin({commit}, {isAuthenticated, user, token}) {
            commit("SET_AUTHENTICATED", isAuthenticated);
            commit("SET_TOKEN", token);
            commit("SET_USER", user);
            localStorage.setItem('apollo-token', token);
            router.push('projects');
        }
    }
};