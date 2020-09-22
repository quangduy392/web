import apiService from '../../services/api';
// Init state
const state = {
    items: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getListMaxBed: (context, params = {}) => {
        return apiService.get('hospitalBed.index', params).then(response => {
            context.commit('GET_LIST_BED', response);
        });
    }
};

// Mutation
const mutations = {
    GET_LIST_BED: (state, response) => {
        state.items = response;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
