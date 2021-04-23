export default {
    namespaced: true,
    state: {
        selectedItems: [],
        viewerMode: 'xray',
        hideOthers: true
    },
    getters: {
        selectedItems(state) {
            return state.selectedItems
        },
        viewerMode(state) {
            return state.viewerMode;
        },
        hideOthers(state) {
            return state.hideOthers
        }
    },
    mutations: {
        SET_ITEMS(state, items) {
            state.selectedItems = items;
        },
        SET_VIEWER_MODE(state, mode) {
            state.viewerMode = mode;
        },
        SET_HIDE_OTHERS(state, boolean) {
            state.hideOthers = boolean;
        }
    },
    actions: {
        setViewerMode({commit}, {mode}) {
            commit('SET_VIEWER_MODE', mode);
        },
        setItems({commit}, {items}) {
            commit('SET_ITEMS', items);
        }
    }
}