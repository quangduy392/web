// Init state
const state = {
    isShowLoading: false
};

// Getters
const getters = {};

// Actions
const actions = {
    showLoading: (context) => {
        context.commit('SHOW_LOADING');
    },
    hideLoading: (context) => {
        context.commit('HIDE_LOADING');
    }
};

// Mutation
const mutations = {
    SHOW_LOADING: () => {
        state.isShowLoading = true;
    },
    HIDE_LOADING: () => {
        state.isShowLoading = false;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
