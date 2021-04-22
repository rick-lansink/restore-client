import ViewerApi from "../../viewer/ViewerApi";
import { apolloClient } from '@/vue-apollo'
import { syncOAuth, getOAuthToken } from '../../graphql/BimOAuth.graphql'
export default {
    namespaced: true,
    state: {
        oAuthToken: null,
        user: null,
        isAuthenticated: false,
        userProjects: []
    },
    getters: {
        authenticated(state) {
            return state.isAuthenticated;
        },
        token(state) {
            return state.oAuthToken;
        }
    },
    mutations: {
        SET_AUTHENTICATED(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
        SET_OAUTH_TOKEN(state, token) {
            state.oAuthToken = token;
        },
        SET_USER(state, data) {
            state.user = data;
        }
    },
    actions: {
        async fetchOAuthToken({commit}, {projectId}) {
            let response = await apolloClient.query({
                query: getOAuthToken,
                variables: {
                    projectId: projectId
                }
            });

            commit('SET_OAUTH_TOKEN', response.data.UserProjectAuth[0].oauthCode);
        },
        async performOAuthLogin() {
            const registration = await ViewerApi.oAuthRegister();
            await ViewerApi.oAuthLogin(registration);
        },
        async syncOAuthCodes(state, {poid, newOAuthToken}) {
            apolloClient.mutate({
                mutation: syncOAuth,
                variables: {
                    poid: poid,
                    token: newOAuthToken
                }
            });
        }
    }
}