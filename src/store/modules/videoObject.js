import apiService from '../../services/api';

// Init state
const state = {
    items: []
};

// Getters
const getters = {};

// Actions
const actions = {
    getList: (context, params) => {
        return apiService.get('videoObject.index', params).then(response => {
            context.commit('GET_LIST_SUCCESS', response);
            return response;
        });
    }
};

// Mutation
const mutations = {
    GET_LIST_SUCCESS: (state, data) => {
        state.items = data;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
